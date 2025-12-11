import classNames from "classnames/bind";
import styles from "./Footer.module.scss";
import Button from "~/components/Button";
import image from "~/assets/image";
const cx = classNames.bind(styles);
function Footer() {
  return (
    <section className={cx("footer")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <div className={cx("footer-left")}>
            <div className={cx("column-list")}>
              <div className={cx("column-item")}>
                <h3 className={cx("title")}>Booking</h3>
                <ul className={cx("footer-list")}>
                  <li className={cx("footer-item")}>My Booking</li>
                  <li className={cx("footer-item")}>Submit Trip Feedback</li>
                  <li className={cx("footer-item")}>Safe Travels Hub</li>
                  <li className={cx("footer-item")}>Travel Alerts</li>
                  <li className={cx("footer-item")}>Vaccinations & Testing</li>
                  <li className={cx("footer-item")}>Flexible Booking</li>
                </ul>
              </div>
              <div className={cx("column-item")}>
                <h3 className={cx("title")}>Company</h3>
                <ul className={cx("footer-list")}>
                  <li className={cx("footer-item")}>About us</li>
                  <li className={cx("footer-item")}>News & Blog</li>
                  <li className={cx("footer-item")}>Press Center</li>
                  <li className={cx("footer-item")}>Investors</li>
                  <li className={cx("footer-item")}>Suppliers</li>
                  <li className={cx("footer-item")}>Terms & Conditions</li>
                  <li className={cx("footer-item")}>Privacy Policy</li>
                </ul>
              </div>
              <div className={cx("column-item")}>
                <h3 className={cx("title")}>Contact</h3>
                <ul className={cx("footer-list")}>
                  <li className={cx("footer-item")}>Get In Touch</li>
                  <li className={cx("footer-item")}>Live Chat</li>
                  <li className={cx("footer-item")}>FAQ</li>
                  <li className={cx("footer-item")}>Testimonials</li>
                </ul>
              </div>
            </div>
          </div>
          <div className={cx("footer-right")}>
            <h3 className={cx("title")}>Subscribe our newsletter</h3>
            <div className={cx("subscribe")}>
              <input
                placeholder="Enter your email"
                className={cx("input-email")}
              ></input>
              <Button active className={cx("btn")}>
                Subscribe
              </Button>
            </div>
            <div className={cx("social")}>
              <h3 className={cx("title")}>Follow us</h3>
              <div className={cx("social-list")}>
                <a
                  className={cx("social-item")}
                  href="#!"
                  aria-label="Facebook"
                >
                  <img
                    src={image.face_book}
                    alt="Facebook"
                    loading="lazy"
                    width="24"
                    height="24"
                  />
                </a>
                <a
                  className={cx("social-item")}
                  href="#!"
                  aria-label="LinkedIn"
                >
                  <img
                    src={image.linked}
                    alt="LinkedIn"
                    loading="lazy"
                    width="24"
                    height="24"
                  />
                </a>
                <a className={cx("social-item")} href="#!" aria-label="Twitter">
                  <img
                    src={image.twitter}
                    alt="Twitter"
                    loading="lazy"
                    width="24"
                    height="24"
                  />
                </a>
                <a
                  className={cx("social-item")}
                  href="#!"
                  aria-label="Instagram"
                >
                  <img
                    src={image.instagram}
                    alt="Instagram"
                    loading="lazy"
                    width="24"
                    height="24"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Footer;
