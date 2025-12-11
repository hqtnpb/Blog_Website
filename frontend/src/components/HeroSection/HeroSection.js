import { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import { format } from "date-fns";
import LazyDateRange from "~/components/LazyDateRange/LazyDateRange";

import styles from "./HeroSection.module.scss";
import Button from "~/components/Button/Button";
import image from "~/assets/image";
const cx = classNames.bind(styles);

function HeroSection({
  heroImage,
  heroBackground,
  title,
  description,
  showForm = true,
  more,
  spotdetails,
  searchresult,
  destination,
  className,
  children,
  ...props
}) {
  const [openDate, setOpenDate] = useState(false);
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  // Tạo ref cho DateRange
  const dateRef = useRef(null);

  // Đóng DateRange khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setOpenDate(false);
      }
    }

    // Lắng nghe sự kiện click
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const classes = cx("hero", {
    destination,
    spotdetails,
    more,
    [className]: className,
  });
  return (
    <section className={classes} {...props}>
      <div className={cx("container")}>
        <div className={cx("inner")}>
          <img
            src={heroBackground}
            alt="Path way background"
            className={cx("background")}
            loading="eager"
          />
          <div className={cx("content")}>
            <h1 className={cx("title")}>{title}</h1>
            <p className={cx("desc")}>{description}</p>

            <div className={cx("search")}>
              {showForm && (
                <form className={cx("form")}>
                  <img
                    src={image.location_icon}
                    alt="Location"
                    className={cx("icon")}
                    loading="eager"
                    width="24"
                    height="24"
                  />
                  <input
                    type="text"
                    placeholder="Where do you want to go?"
                    className={cx("input")}
                  />
                  <img
                    src={image.calendar_icon}
                    alt="Calendar"
                    className={cx("icon")}
                    onClick={() => setOpenDate(!openDate)}
                    loading="eager"
                    width="24"
                    height="24"
                  />

                  {/* Bọc DateRange trong div có ref */}
                  <div ref={dateRef}>
                    {openDate && (
                      <LazyDateRange
                        date={date}
                        onChange={(item) => setDate([item.selection])}
                        className={cx("date")}
                      />
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder={`${format(
                      date[0].startDate,
                      "dd/MM/yyyy"
                    )} - ${format(date[0].endDate, "dd/MM/yyyy")}`}
                    className={cx("input")}
                    onClick={() => setOpenDate(!openDate)}
                  />

                  <Button active className={cx("btn")} type="button">
                    Search
                  </Button>
                </form>
              )}
            </div>
            {heroImage && (
              <img
                src={heroImage}
                alt="Destination hero image"
                className={cx("image")}
                loading="lazy"
                width="1170"
                height="500"
              />
            )}

            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
