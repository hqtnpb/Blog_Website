const userController = require("../controllers/userController");
const router = require("express").Router();
const verifyJWT = require("../middleWare/authMiddleWare");

router.post("/get-profile", userController.getProfile);
router.post("/become-partner", userController.becomePartner);
router.put("/update-profile", verifyJWT, userController.updateProfile);
router.put("/update-avatar", verifyJWT, userController.updateAvatar);
router.put("/change-password", verifyJWT, userController.changePassword);

module.exports = router;
