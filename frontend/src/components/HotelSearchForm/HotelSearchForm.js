import React from "react";
import { Input, DatePicker, Select, Button } from "antd";
import {
    SearchOutlined,
    CalendarOutlined,
    UserOutlined,
} from "@ant-design/icons";
import classNames from "classnames/bind";
import styles from "./HotelSearchForm.module.scss";

const cx = classNames.bind(styles);
const { RangePicker } = DatePicker;
const { Option } = Select;

function HotelSearchForm() {
    return (
        <div className={cx("hotel-search-form")}>
            <Input
                className={cx("search-input")}
                placeholder="Search destination"
                prefix={<SearchOutlined />}
            />
            <RangePicker className={cx("date-picker")} />
            <Select
                className={cx("guest-select")}
                defaultValue="2 guests, 1 room"
            >
                <Option value="1">1 guest, 1 room</Option>
                <Option value="2">2 guests, 1 room</Option>
                <Option value="3">2 guests, 2 rooms</Option>
            </Select>
            <Button type="primary" className={cx("search-button")}>
                Search
            </Button>
        </div>
    );
}

export default HotelSearchForm;
