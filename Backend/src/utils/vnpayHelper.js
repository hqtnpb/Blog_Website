const crypto = require("crypto");
const querystring = require("querystring");

/**
 * VNPay Helper Functions
 * Documentation: https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/
 */

// Hàm loại bỏ dấu Tiếng Việt (QUAN TRỌNG: Để tránh lỗi Checksum khi tạo URL)
function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

// Sort object keys alphabetically
function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    // VNPay yêu cầu khoảng trắng thay bằng dấu +, các ký tự khác encodeURI
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// FIX: Format date chuẩn múi giờ Việt Nam (GMT+7)
// Nếu deploy lên server nước ngoài (AWS, Render, Vercel) mà dùng new Date() thường sẽ bị lệch giờ -> Lỗi 03 hoặc Expired
function formatDate(date) {
  const vnDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  const year = vnDate.getFullYear();
  const month = String(vnDate.getMonth() + 1).padStart(2, "0");
  const day = String(vnDate.getDate()).padStart(2, "0");
  const hours = String(vnDate.getHours()).padStart(2, "0");
  const minutes = String(vnDate.getMinutes()).padStart(2, "0");
  const seconds = String(vnDate.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Create VNPay payment URL
function createVNPayPaymentUrl(params) {
  const {
    amount,
    orderId,
    orderInfo,
    returnUrl,
    ipAddr,
    locale = "vn",
  } = params;

  // Kiểm tra dữ liệu đầu vào quan trọng
  if (!returnUrl) {
    console.error("❌ LỖI: Thiếu returnUrl khi tạo thanh toán VNPay");
    // Fallback về localhost nếu thiếu (chỉ dùng để test, production phải fix)
    // returnUrl = "http://localhost:3000/payment/callback";
  }

  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL;

  const date = new Date();
  const createDate = formatDate(date);
  const expireDate = formatDate(new Date(date.getTime() + 15 * 60 * 1000));

  const realIp =
    ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1" ? "127.0.0.1" : ipAddr;
  const cleanOrderInfo = removeVietnameseTones(orderInfo);

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: cleanOrderInfo,
    vnp_OrderType: "other",
    vnp_Amount: Math.floor(amount * 100),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: realIp,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  // BƯỚC 1: Sắp xếp và encode dữ liệu
  vnp_Params = sortObject(vnp_Params);

  // BƯỚC 2: Tạo chuỗi dữ liệu (Dùng cách thủ công để tránh lỗi [object Object])
  // Kết quả sẽ là: key=value&key2=value2
  const signData = Object.keys(vnp_Params)
    .map((key) => `${key}=${vnp_Params[key]}`)
    .join("&");

  // BƯỚC 3: Tạo chữ ký HMAC SHA512
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // BƯỚC 4: Ghép chữ ký vào URL cuối cùng
  // Lưu ý: signData đã chuẩn format rồi, chỉ cần nối thêm chữ ký
  const paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;

  return paymentUrl;
}

// Verify VNPay callback signature
function verifyVNPayCallback(vnpParams) {
  const secureHash = vnpParams["vnp_SecureHash"];
  const secretKey = process.env.VNPAY_HASH_SECRET;

  console.log("🔐 [VNPay Verify] Received hash:", secureHash);
  console.log(
    "🔐 [VNPay Verify] Secret key:",
    secretKey ? "***" + secretKey.slice(-4) : "MISSING"
  );

  // Tạo bản sao để không ảnh hưởng object gốc
  const paramsToVerify = { ...vnpParams };
  delete paramsToVerify["vnp_SecureHash"];
  delete paramsToVerify["vnp_SecureHashType"];

  const sortedParams = sortObject(paramsToVerify);

  // Dùng cách thủ công giống như khi tạo URL (để đảm bảo consistency)
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join("&");

  console.log("🔐 [VNPay Verify] Sign data:", signData);

  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  console.log("🔐 [VNPay Verify] Calculated hash:", signed);
  console.log("🔐 [VNPay Verify] Match:", secureHash === signed);

  return secureHash === signed;
}

// Parse VNPay response code
function parseVNPayResponseCode(code) {
  const responseCodes = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
    "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
    10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
    12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
    13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
    24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
    51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
    65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
    75: "Ngân hàng thanh toán đang bảo trì.",
    79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
    99: "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
  };

  return responseCodes[code] || "Lỗi không xác định";
}

// Query transaction status from VNPay
async function queryVNPayTransaction(params) {
  const axios = require("axios");
  const { orderId, transactionDate } = params;

  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const apiUrl = process.env.VNPAY_API_URL;

  const requestId = `${Date.now()}`;
  const createDate = formatDate(new Date());

  let vnp_Params = {
    vnp_RequestId: requestId,
    vnp_Version: "2.1.0",
    vnp_Command: "querydr",
    vnp_TmnCode: tmnCode,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Query transaction ${orderId}`,
    vnp_TransactionDate: transactionDate,
    vnp_CreateDate: createDate,
    vnp_IpAddr: "127.0.0.1",
  };

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  try {
    const response = await axios.post(apiUrl, vnp_Params);
    return response.data;
  } catch (error) {
    throw new Error(`VNPay query error: ${error.message}`);
  }
}

// Refund transaction (only available for some VNPay accounts)
async function refundVNPayTransaction(params) {
  const axios = require("axios");
  const { orderId, amount, transactionDate, refundReason } = params;

  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const apiUrl = process.env.VNPAY_API_URL;

  const requestId = `${Date.now()}`;
  const createDate = formatDate(new Date());

  let vnp_Params = {
    vnp_RequestId: requestId,
    vnp_Version: "2.1.0",
    vnp_Command: "refund",
    vnp_TmnCode: tmnCode,
    vnp_TransactionType: "02", // Full refund
    vnp_TxnRef: orderId,
    vnp_Amount: Math.floor(amount * 100), // FIX: Làm tròn số tiền
    vnp_OrderInfo: refundReason || `Refund for order ${orderId}`,
    vnp_TransactionDate: transactionDate,
    vnp_CreateDate: createDate,
    vnp_CreateBy: "system",
    vnp_IpAddr: "127.0.0.1",
  };

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  try {
    const response = await axios.post(apiUrl, vnp_Params);
    return response.data;
  } catch (error) {
    throw new Error(`VNPay refund error: ${error.message}`);
  }
}

module.exports = {
  createVNPayPaymentUrl,
  verifyVNPayCallback,
  parseVNPayResponseCode,
  queryVNPayTransaction,
  refundVNPayTransaction,
  formatDate,
  sortObject,
  removeVietnameseTones, // Export thêm hàm này nếu cần dùng ở chỗ khác
};
