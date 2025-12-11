import classNames from "classnames/bind";
import styles from "./FeaturesSection.module.scss";
import Button from "../Button/Button";
import image from "~/assets/image";
const cx = classNames.bind(styles);

function FeaturesSection() {
  return (
    <section className={cx("feature")}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <div className={cx("left")}>
            <div className={cx("content")}>
              <h2 className={cx("title")}>
                Why travel with us around the world?
              </h2>
              <p className={cx("desc")}>
                We’ve been trusted by customers around the world since 2005 to
                provide service they can rely on, that makes travel dreams come
                true.
              </p>
            </div>
            <Button active className={cx("btn")}>
              Get Started
            </Button>
          </div>
          <div className={cx("right")}>
            {/* Card 1 */}
            <article className={cx("card")}>
              <img
                src={image.feature_01}
                alt="Find experiences icon"
                className={cx("decor-img")}
                loading="lazy"
                width="64"
                height="64"
              />
              <div className={cx("content")}>
                <h3 className={cx("title")}>
                  Find best and authentic experiences
                </h3>
                <p className={cx("desc")}>
                  Follow your curiosity, feel the joy of real discoveries, and
                  explore more of the world.
                </p>
              </div>
            </article>

            {/* Card 2 */}
            <article className={cx("card")}>
              <img
                src={image.feature_02}
                alt="Book with flexibility icon"
                className={cx("decor-img")}
                loading="lazy"
                width="64"
                height="64"
              />
              <div className={cx("content")}>
                <h3 className={cx("title")}>
                  Book with your flexibility and comfort
                </h3>
                <p className={cx("desc")}>
                  Get free cancellation, plan on the go, and book last minute.
                  Discover the world your way.
                </p>
              </div>
            </article>

            {/* Card 3 */}
            <article className={cx("card")}>
              <img
                src={image.feature_03}
                alt="Explore possibilities icon"
                className={cx("decor-img")}
                loading="lazy"
                width="64"
                height="64"
              />
              <div className={cx("content")}>
                <h3 className={cx("title")}>
                  Explore your best ever possibilities
                </h3>
                <p className={cx("desc")}>
                  Enjoy personalized recommendations and itineraries with over
                  60,000+ guided tours.
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
