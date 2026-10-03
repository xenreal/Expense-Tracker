from datetime import date, timedelta

def get_period_dates(period: str) -> tuple[date , date]:
    today = date.today()

    if period == "week":
        start_date = today - timedelta(days=today.weekday())
        end_date = today

    elif period == "month":
        start_date = today.replace(day=1)                     # 1st of month
        end_date = today

    elif period == "year":
        start_date = today.replace(month=1, day=1)            # Jan 1st
        end_date = today

    elif period == "6 months":
        start_date = today - timedelta(days=180)
        end_date = today

    else:
        return None, None

    return start_date, end_date

  