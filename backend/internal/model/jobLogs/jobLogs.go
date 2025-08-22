package joblogs

type JobLogs struct {
	Data struct {
		Result []struct {
			Values [][]interface{} `json:"values"`
		} `json:"result"`
	} `json:"data"`
}

type LogResult struct {
	Msg     string `json:"msg"`
	Changed bool   `json:"changed"`
}

type Log struct {

	// Task Fields
	Task     string    `json:"task"`
	Host     string    `json:"host"`
	Role     string    `json:"role"`
	Res      LogResult `json:"res"`
	Duration float64   `json:"duration"`

	Changed   map[string]int `json:"changed"`
	Failures  map[string]int `json:"failures"`
	Ignored   map[string]int `json:"ignored"`
	Ok        map[string]int `json:"ok"`
	Processed map[string]int `json:"processed"`
	Skipped   map[string]int `json:"skipped"`
	Error     string         `json:"error"`
	Event     string         `json:"event"`
}

// {\"changed\": {}, \"failures\": {\"22\": 1}, \"ignored\": {}, \"ok\": {\"22\": 3}, \"processed\": {\"22\": 1}, \"skipped\": {\"22\": 1}, \"event\": \"playbook_on_stats\"}
