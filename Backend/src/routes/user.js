const userController = require("../controllers/userController");
const router = require("express").Router();

router.post("/get-profile", userController.getProfile);
router.post("/become-partner", userController.becomePartner);
module.exports = router;