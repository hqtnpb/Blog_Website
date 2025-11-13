//Layout
import { HeaderOnly } from "~/components/Layout";

import Home from "~/pages/Home";
import Destination from "~/pages/Destination";
import SignUp from "~/pages/SignUp";
import Login from "~/pages/Login";
import Error from "~/components/Error";
import Popup from "~/components/PopUp";
import About from "~/pages/About";
import MoreInPlace from "~/pages/MoreInPlace";
import SpotDetails from "~/pages/SpotDetails";
import SearchResult from "~/pages/SearchResults/SearchResult";

import Contact from "~/pages/Contact/Contact";
import EditorPage from "~/pages/EditorPage";
import Suggestions from "~/pages/Suggestions";
import Commingsoon from "~/pages/Commingsoon";
import Blog from "~/pages/Blog";
import SearchPage from "~/pages/SearchPage";
import ProfilePage from "~/pages/ProfilePage/ProfilePage";
import BlogDetails from "~/pages/BlogDetails/BlogDetails";
import SideNav from "~/components/SideNav/SideNav";
import Notifications from "~/pages/Notifications/Notifications";
import ManageBlogs from "~/pages/ManageBlogs";
import HotelPage from "~/pages/HotelPage/HotelPage";
// const EditProfilePlaceholder = () => <h2>Edit Profile Page (Coming Soon)</h2>;
// const ChangePasswordPlaceholder = () => (
//     <h2>Change Password Page (Coming Soon)</h2>
// );

//public routes
const publicRoutes = [
    { path: "/", component: Home },
    {
        path: "/settings",
        component: SideNav,
        layout: HeaderOnly,
        children: [
            {
                path: "edit-profile",
                component: Commingsoon,
            },
            {
                path: "change-password",
                component: Commingsoon,
            },
        ],
    },
    {
        path: "/dashboard",
        component: SideNav,
        layout: HeaderOnly,
        children: [
            {
                path: "blogs",
                component: ManageBlogs,
            },
            {
                path: "notification",
                component: Notifications,
            },
        ],
    },
    { path: "/signup", component: SignUp, layout: HeaderOnly },
    { path: "/signin", component: Login, layout: HeaderOnly },
    { path: "/destination", component: Destination },
    { path: "/more", component: MoreInPlace },
    { path: "/popup", component: Popup },
    { path: "/about", component: About },
    { path: "/spotdetails", component: SpotDetails },
    { path: "/searchresult", component: SearchResult },
    { path: "/contact", component: Contact },
    { path: "/editor", component: EditorPage, layout: null },
    { path: "/editor/:blog_id", component: EditorPage, layout: null },
    { path: "/suggestions", component: Suggestions, layout: HeaderOnly },
    { path: "/commingsoon", component: Commingsoon, layout: HeaderOnly },
    { path: "/blog", component: Blog },
    { path: "/user/:id", component: ProfilePage, layout: HeaderOnly },
    { path: "/search/:query", component: SearchPage },
    { path: "/blog/:blog_id", component: BlogDetails },
    {path: "/hotels", component: HotelPage, layout: HeaderOnly},
    { path: "*", component: Error, layout: null },
];

//private routes
const privateRoutes = [];

export { publicRoutes, privateRoutes };
