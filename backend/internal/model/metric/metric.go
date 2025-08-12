package metric

type Overview struct {
	Enitity      string `json:"entity" db:"entity"`
	CurrentMonth int    `json:"currentMonth" db:"currentmonth"`
	LastMont     int    `json:"lastMonth" db:"lastmonth"`
	Total        int    `json:"total" db:"total"`
}
