import classNames from "classnames/bind";
import styles from "./HotelPage.module.scss";
const cx = classNames.bind(styles);

function HotelPage() {
    return (
        <div className={cx("hotel-page")}>
            <div className={cx("hero-section")}>
                <div className={cx("container")}>
                    <h1 className={cx("hero__title")}>
                        Make your travel whishlist, we’ll do the rest
                    </h1>
                    <p className={cx("hero__desc")}>
                        Special offers to suit your plan
                    </p>
                </div>
            </div>
        </div>
    );
}

export default HotelPage;
