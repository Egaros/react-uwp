import * as React from "react";
import * as PropTypes from "prop-types";

import Separator from "../Separator";
import IconButton from "../IconButton";
import ElementState from "../ElementState";
import ListView from "../ListView";
import scrollToYEasing from "../common/browser/scrollToYEasing";
import { dayList, monthList, getLastDayOfMonth } from "../common/date.utils";

export interface DataProps {
  /**
   * Set default date.
   */
  defaultDate?: Date;
  /**
   * `onChangeDate` callback.
   */
  onChangeDate?: (date?: Date) => void;
  /**
   * Set can choose max year.
   */
  maxYear?: number;
  /**
   * Set can choose min year.
   */
  minYear?: number;
  /**
   * Set `Input` element height.
   */
  inputItemHeight?: number;
  /**
   * Set `Picker` element height.
   */
  pickerItemHeight?: number;
  /**
   * Set custom background.
   */
  background?: string;
}

export interface DatePickerProps extends DataProps, React.HTMLAttributes<HTMLDivElement> {}

export interface DatePickerState {
  showPicker?: boolean;
  currDate?: Date;
}

const emptyFunc = () => {};
export class DatePicker extends React.Component<DatePickerProps, DatePickerState> {
  static defaultProps: DatePickerProps = {
    inputItemHeight: 28,
    pickerItemHeight: 44,
    onChangeDate: emptyFunc,
    defaultDate: new Date(),
    maxYear: new Date().getFullYear() + 50,
    minYear: new Date().getFullYear() - 50
  };

  state: DatePickerState = {
    showPicker: false,
    currDate: this.props.defaultDate
  };

  prevDate: Date = this.props.defaultDate;

  static contextTypes = { theme: PropTypes.object };
  context: { theme: ReactUWP.ThemeType };

  monthListView: ListView;
  dateListView: ListView;
  yearListView: ListView;

  monthIndex: number = 0;
  dateIndex: number = 0;
  yearIndex: number = 0;

  componentWillReceiveProps(nextProps: DatePickerProps) {
    if (nextProps.defaultDate !== this.state.currDate) {
      this.setState({ currDate: nextProps.defaultDate });
    }
  }

  componentDidUpdate() {
    const { pickerItemHeight } = this.props;
    scrollToYEasing(this.monthListView.rootElm, this.monthIndex * pickerItemHeight, 0.1);
    scrollToYEasing(this.dateListView.rootElm, this.dateIndex * pickerItemHeight, 0.1);
    scrollToYEasing(this.yearListView.rootElm, this.yearIndex * pickerItemHeight, 0.1);
  }

  toggleShowPicker = (showPicker?: any) => {
    const { currDate } = this.state;
    if (typeof showPicker === "boolean") {
      if (showPicker !== this.state.showPicker) {
        this.setState({ showPicker });
        if (showPicker) {
          this.prevDate = currDate;
        }
      }
    } else {
      this.setState((prevState, prevProps) => {
        const showPicker = !prevState.showPicker;
        if (showPicker) {
          this.prevDate = currDate;
        }
        return { showPicker };
      });
    }
  }

  setDate = (date?: number, month?: number, year?: number) => {
    const { currDate } = this.state;
    const currDateNumb = date === void 0 ? currDate.getDate() : date;
    const currMonth = month === void 0 ? currDate.getMonth() : month;
    const currYear = year === void 0 ? currDate.getFullYear() : year;
    this.setState({ currDate: new Date(currYear, currMonth, currDateNumb) });
  }

  render() {
    const {
      onChangeDate,
      defaultDate,
      maxYear,
      minYear,
      inputItemHeight,
      pickerItemHeight,
      background,
      ...attributes
    } = this.props;
    const {
      currDate,
      showPicker
    } = this.state;
    const { theme } = this.context;
    const styles = getStyles(this);

    const separator = <Separator direction="column" style={{ margin: 0 }} />;

    const currYear = currDate.getFullYear();
    const currMonth = currDate.getMonth();
    const currDateNumb = currDate.getDate();

    const monthArray = monthList;
    const dateArray = Array(getLastDayOfMonth(currDate).getDate()).fill(0).map((numb, index) => index + 1);
    const yearArray = Array(maxYear - minYear).fill(0).map((numb, index) => minYear + index);

    this.monthIndex = currMonth;
    this.dateIndex = dateArray.indexOf(currDateNumb);
    this.yearIndex = yearArray.indexOf(currYear);

    return (
      <ElementState
        {...attributes as any}
        style={styles.root}
        hoverStyle={{ boxShadow: `inset 0 0 0 2px ${theme.baseMediumHigh}` }}
      >
      <div>
        <div style={styles.pickerModal}>
          <div style={styles.listViews}>
            <ListView
              ref={monthListView => this.monthListView = monthListView}
              style={styles.listView}
              listItemStyle={styles.listItem}
              defaultFocusListIndex={currMonth}
              listSource={monthArray}
              onChooseItem={month => {
                this.setDate(void 0, month, void 0);
              }}
            />
            <ListView
              ref={dateListView => this.dateListView = dateListView}
              style={styles.listView}
              listItemStyle={styles.listItem}
              defaultFocusListIndex={this.dateIndex}
              listSource={dateArray}
              onChooseItem={dayIndex => {
                this.setDate(dayIndex + 1, void 0, void 0);
              }}
            />
            <ListView
              ref={yearListView => this.yearListView = yearListView}
              style={styles.listView}
              listItemStyle={styles.listItem}
              defaultFocusListIndex={this.yearIndex}
              listSource={yearArray}
              onChooseItem={yearIndex => {
                this.setDate(void 0, void 0, minYear + yearIndex);
              }}
            />
          </div>
          <div style={{ boxShadow: `inset 0 0 0 1px ${theme.baseLow}` }}>
            <IconButton
              style={styles.iconButton}
              size={pickerItemHeight}
              onClick={() => {
                onChangeDate(currDate);
                this.setState({ showPicker: false });
              }}
            >
              AcceptLegacy
            </IconButton>
            <IconButton
              style={styles.iconButton}
              size={pickerItemHeight}
              onClick={() => {
                this.setState({ currDate: this.prevDate, showPicker: false });
              }}
            >
              ClearLegacy
            </IconButton>
          </div>
        </div>
        <span
          style={styles.button}
          onClick={this.toggleShowPicker}
        >
          {monthList[currMonth]}
        </span>
        {separator}
        <span
          style={styles.button}
          onClick={this.toggleShowPicker}
        >
          {currDateNumb}
        </span>
        {separator}
        <span
          style={styles.button}
          onClick={this.toggleShowPicker}
        >
          {currYear}
        </span>
      </div>
      </ElementState>
    );
  }
}

function getStyles(datePicker: DatePicker): {
  root?: React.CSSProperties;
  button?: React.CSSProperties;
  pickerModal?: React.CSSProperties;
  listViews?: React.CSSProperties;
  listView?: React.CSSProperties;
  listItem?: React.CSSProperties;
  iconButton?: React.CSSProperties;
} {
  const {
    context: { theme },
    props: {
      style,
      inputItemHeight,
      pickerItemHeight,
      background
    },
    state: {
      showPicker
    }
  } = datePicker;
  const { prepareStyles } = theme;
  const currBackground = background || (theme.useFluentDesign ? theme.acrylicTextures.acrylicTexture80 : theme.chromeLow);

  return {
    root: prepareStyles({
      width: 320,
      flex: "0 0 auto",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      verticalAlign: "middle",
      color: theme.baseMediumHigh,
      boxShadow: `inset 0 0 0 2px ${theme.baseMediumLow}`,
      height: inputItemHeight,
      lineHeight: `${inputItemHeight}px`,
      position: "relative",
      transition: "all .25s ease-in-out",
      background: currBackground,
      ...style
    }),
    pickerModal: prepareStyles({
      overflow: "hidden",
      flex: "0 0 auto",
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      opacity: showPicker ? 1 : 0,
      transform: `scaleY(${showPicker ? 1 : 0}) translateY(-50%)`,
      transformOrigin: "top",
      pointerEvents: showPicker ? "all" : "none",
      zIndex: theme.zIndex.flyout,
      transition: "all .25s ease-in-out"
    }),
    listViews: prepareStyles({
      border: `1px solid ${theme.listLow}`,
      flex: "0 0 auto",
      width: "100%",
      height: pickerItemHeight * 7,
      display: "flex",
      flexDirection: "row"
    }),
    listView: prepareStyles({
      userSelect: "none",
      border: "none",
      borderLeft: `1px solid ${theme.listLow}`,
      padding: `${pickerItemHeight * 3}px 0`,
      width: "auto",
      height: pickerItemHeight * 7,
      overflowY: "auto",
      flex: "1 1 auto"
    }),
    listItem: {
      padding: "0 8px",
      height: pickerItemHeight,
      lineHeight: `${pickerItemHeight}px`,
      flex: "0 0 auto",
      fontSize: pickerItemHeight / 3
    },
    button: {
      flex: "1 1 auto",
      display: "inline-block",
      cursor: "default",
      verticalAlign: "top",
      height: inputItemHeight - 4,
      lineHeight: `${inputItemHeight - 4}px`,
      padding: `0 ${inputItemHeight - 4}px`
    },
    iconButton: {
      verticalAlign: "top",
      width: "50%",
      height: pickerItemHeight
    }
  };
}

export default DatePicker;
