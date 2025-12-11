import classNames from "classnames/bind";
import styles from "./SpotDetails.module.scss";
import HeroSection from "~/components/HeroSection";
import image from "~/assets/image";
import OverView from "~/components/OverView";
import Card from "~/components/Card";
import Button from "~/components/Button";

const cx = classNames.bind(styles);

const cardData = [
  {
    imgSrc: image.popular_sydney_01,
    category: "Iconic building",
    title: "Sydney Tower Eye",
    rating: 5.0,
  },

  {
    imgSrc: image.popular_sydney_02,
    category: "Oasislike gardens with glasshouses",
    title: "Royal Botanic Garden Sydney",
    rating: 4.8,
  },

  {
    imgSrc: image.popular_sydney_03,
    category: "Large zoo divided",
    title: "Taronga Zoo Sydney",
    rating: 4.5,
  },
];
function SpotDetails() {
  return (
    <div className={cx("spotdetails")}>
      <HeroSection
        heroImage={image.spotdetails_img}
        heroBackground={image.spotdetails_background}
        title={"Sydney Harbour Bridge"}
        description={
          "Sydneysiders love their giant 'coathanger', which opened in 1932. The best way to experience this majestic structure is on foot. Stairs and lifts ascend the bridge from both shores, leading to a footpath on the eastern side (the western side is a bike path)."
        }
        showForm={false}
        spotdetails
      >
        <div className={cx("city")}>
          <img className={cx("icon")} src={image.icon_spotdetails} alt="Icon" />
          <p className={cx("location")}>Sydney Harbour Bridge</p>
        </div>
      </HeroSection>
      <OverView></OverView>
      <div className={cx("popular")}>
        <div className={cx("container")}>
          <div className={cx("inner")}>
            <div className={cx("content")}>
              <h2 className={cx("title")}>Popular places around Sydney</h2>
            </div>
            <Button active className={cx("btn")}>
              Nhiều điểm đến hơn
            </Button>

            <div className={cx("card-list")}>
              {cardData.map((data, index) => (
                <Card
                  key={index}
                  imgSrc={data.imgSrc}
                  category={data.category}
                  title={data.title}
                  rating={data.rating}
                  popular
                ></Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpotDetails;
