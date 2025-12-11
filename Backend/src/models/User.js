const mongoose = require("mongoose");
const { Schema } = mongoose;
let profile_imgs_name_list = [
    "Garfield",
    "Tinkerbell",
    "Annie",
    "Loki",
    "Cleo",
    "Angel",
    "Bob",
    "Mia",
    "Coco",
    "Gracie",
    "Bear",
    "Bella",
    "Abby",
    "Harley",
    "Cali",
    "Leo",
    "Luna",
    "Jack",
    "Felix",
    "Kiki",
];
let profile_imgs_collections_list = [
    "notionists-neutral",
    "adventurer-neutral",
    "fun-emoji",
];

const userSchema = new mongoose.Schema(
    {
        personal_info: {
            username: {
                type: String,
                minLength: 3,
                unique: true,
            },
            email: {
                type: String,
                required: true,
                lowercase: true,
                unique: true,
            },
            password: {
                type: String,
            },
            role: {
                type: String,
                enum: ['user', 'partner', 'admin'],
                default: 'user',
            },
            bio: {
                type: String,
                maxlength: [200, "Bio should not be more than 200"],
                default: "",
            },
            profile_img: {
                type: String,
                default: () => {
                    return `https://api.dicebear.com/6.x/${profile_imgs_collections_list[Math.floor(Math.random() * profile_imgs_collections_list.length)]}/svg?seed=${profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)]}`;
                },
            },
        },
        social_links: {
            youtube: {
                type: String,
                default: "",
            },
            instagram: {
                type: String,
                default: "",
            },
            facebook: {
                type: String,
                default: "",
            },
            twitter: {
                type: String,
                default: "",
            },
            github: {
                type: String,
                default: "",
            },
            website: {
                type: String,
                default: "",
            },
        },
        account_info: {
            total_posts: {
                type: Number,
                default: 0,
            },
            total_reads: {
                type: Number,
                default: 0,
            },
        },
        google_auth: {
            type: Boolean,
            default: false,
        },
        partner_info: {
            hotel: [{
                type: Schema.Types.ObjectId,
                ref: "Hotel",
            }],
            airline: {
                type: Schema.Types.ObjectId,
                ref: "Airline",
            },
        },
        blogs: {
            type: [Schema.Types.ObjectId],
            ref: "blogs",
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
