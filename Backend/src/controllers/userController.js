const User = require("../models/User");

const userController = {
    getProfile: (req, res) => {
        let { username } = req.body;

        User.findOne({ "personal_info.username": username })
            .select("-personal_info.password -google_auth -updatedAt -blogs")
            .then((user) => {
                return res.status(200).json(user);
            })
            .catch((error) => {
                return res.status(500).json({ error: error.message });
            });
    },

    becomePartner: async (req, res) => {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ error: "User ID is required." });
            }

            const user = await User.findByIdAndUpdate(
                userId,
                { "personal_info.role": "partner" },
                { new: true, runValidators: true }
            ).select("-personal_info.password -google_auth -updatedAt -blogs");

            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }

            return res.status(200).json({ message: "User role updated to partner successfully.", user });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
};

module.exports = userController;
