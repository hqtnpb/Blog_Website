import { lazy, Suspense } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// Lazy load DateRange component
const DateRange = lazy(() =>
  import("react-date-range").then((module) => ({
    default: module.DateRange,
  }))
);

function LazyDateRange({ date, onChange, className }) {
  return (
    <Suspense fallback={<div>Loading calendar...</div>}>
      <DateRange
        editableDateInputs={true}
        onChange={onChange}
        moveRangeOnFirstSelection={false}
        ranges={date}
        className={className}
      />
    </Suspense>
  );
}

export default LazyDateRange;
