import { lazy } from "react";

//Layout
import { HeaderOnly } from "~/components/Layout";
import { AdminLayout } from "~/components/Layout";

// Critical pages - loaded immediately
import Home from "~/pages/Home";
import Login from "~/pages/Login";
import SignUp from "~/pages/SignUp";
import Error from "~/components/Error";
import SideNav from "~/components/SideNav/SideNav";

// Lazy-loaded pages - loaded on demand
const Destination = lazy(() => import("~/pages/Destination"));
const Popup = lazy(() => import("~/components/PopUp"));
const About = lazy(() => import("~/pages/About"));
const MoreInPlace = lazy(() => import("~/pages/MoreInPlace"));
const SpotDetails = lazy(() => import("~/pages/SpotDetails"));
const SearchResult = lazy(() => import("~/pages/SearchResults/SearchResult"));
const Contact = lazy(() => import("~/pages/Contact/Contact"));
const EditorPage = lazy(() => import("~/pages/EditorPage"));
const Suggestions = lazy(() => import("~/pages/Suggestions"));
const Commingsoon = lazy(() => import("~/pages/Commingsoon"));
const Blog = lazy(() => import("~/pages/Blog"));
const EditProfile = lazy(() => import("~/pages/EditProfile"));
const ChangePassword = lazy(() => import("~/pages/ChangePassword"));
const SearchPage = lazy(() => import("~/pages/SearchPage"));
const ProfilePage = lazy(() => import("~/pages/ProfilePage/ProfilePage"));
const BlogDetails = lazy(() => import("~/pages/BlogDetails/BlogDetails"));
const Notifications = lazy(() => import("~/pages/Notifications/Notifications"));
const ManageBlogs = lazy(() => import("~/pages/ManageBlogs"));
const HotelPage = lazy(() => import("~/pages/HotelPage/HotelPage"));
const HotelDetails = lazy(() => import("~/pages/HotelDetails/HotelDetails"));
const AdminDashboard = lazy(() =>
  import("~/pages/AdminDashboard/AdminDashboard")
);
const AdminSettings = lazy(() => import("~/pages/AdminSettings"));
const AdminHotels = lazy(() => import("~/pages/AdminHotels"));
const AdminRooms = lazy(() => import("~/pages/AdminRooms"));
const AdminBookings = lazy(() => import("~/pages/AdminBookings"));
const AdminReviews = lazy(() => import("~/pages/AdminReviews"));
const AdminCalendar = lazy(() => import("~/pages/AdminCalendar"));
const AdminNotifications = lazy(() => import("~/pages/AdminNotifications"));
const AdminPayments = lazy(() => import("~/pages/AdminPayments"));
const AdminReports = lazy(() => import("~/pages/AdminReports"));
const BookingPage = lazy(() => import("~/pages/BookingPage"));
const PaymentPage = lazy(() => import("~/pages/PaymentPage"));
const RoomDetails = lazy(() => import("~/pages/RoomDetails"));
const UserBookings = lazy(() => import("~/pages/UserBookings"));
const BookingResult = lazy(() => import("~/pages/BookingResult"));

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
        component: EditProfile,
      },
      {
        path: "change-password",
        component: ChangePassword,
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
      {
        path: "bookings",
        component: UserBookings,
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
  { path: "/search-results", component: SearchResult },
  { path: "/contact", component: Contact },
  { path: "/editor", component: EditorPage, layout: null },
  { path: "/editor/:blog_id", component: EditorPage, layout: null },
  { path: "/suggestions", component: Suggestions, layout: HeaderOnly },
  { path: "/commingsoon", component: Commingsoon, layout: HeaderOnly },
  { path: "/blog", component: Blog },
  { path: "/user/:id", component: ProfilePage, layout: HeaderOnly },
  { path: "/search/:query", component: SearchPage },
  { path: "/blog/:blog_id", component: BlogDetails },
  { path: "/hotels", component: HotelPage, layout: HeaderOnly },
  { path: "/hotels/:hotel_id", component: HotelDetails, layout: HeaderOnly },
  {
    path: "/room/:hotel_id/:room_id",
    component: RoomDetails,
    layout: HeaderOnly,
  },
  {
    path: "/booking/:hotel_id/:room_id",
    component: BookingPage,
    layout: HeaderOnly,
  },
  { path: "/payment/:booking_id", component: PaymentPage, layout: HeaderOnly },
  { path: "/booking/success", component: BookingResult, layout: HeaderOnly },
  { path: "/booking/failed", component: BookingResult, layout: HeaderOnly },
  { path: "/booking/error", component: BookingResult, layout: HeaderOnly },
  { path: "/admin/dashboard", component: AdminDashboard, layout: AdminLayout },
  { path: "/admin/settings", component: AdminSettings, layout: AdminLayout },
  { path: "/admin/hotels", component: AdminHotels, layout: AdminLayout },
  { path: "/admin/rooms", component: AdminRooms, layout: AdminLayout },
  { path: "/admin/bookings", component: AdminBookings, layout: AdminLayout },
  { path: "/admin/reviews", component: AdminReviews, layout: AdminLayout },
  { path: "/admin/calendar", component: AdminCalendar, layout: AdminLayout },
  {
    path: "/admin/notifications",
    component: AdminNotifications,
    layout: AdminLayout,
  },
  { path: "/admin/payments", component: AdminPayments, layout: AdminLayout },
  { path: "/admin/reports", component: AdminReports, layout: AdminLayout },
  { path: "*", component: Error, layout: null },
];

//private routes
const privateRoutes = [];

export { publicRoutes, privateRoutes };
