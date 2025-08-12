package metric

type Overview struct {
	Entity       string `json:"entity" db:"entity"`
	CurrentMonth int    `json:"currentMonth" db:"currentmonth"`
	LastMonth    int    `json:"lastMonth" db:"lastmonth"`
	Total        int    `json:"total" db:"total"`
}
