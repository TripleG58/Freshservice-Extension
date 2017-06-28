Freshservice Extension

Displays "Created_at" field on tickets that don't list it due to them showing "Agent responded:", "Closed at:", "Resolved:", or "Requester responded:"
This chrome extension will cause one http request to be sent to Freshservice every time a new page of tickets is viewed in the browser. 
Optimization welcome :) - looking to find a way to get the info from the single http request the native web UI makes and avoid the need to send aditional requests. 
jQuery handlers were initially attached to the "#prev_page" and "#next_page" links, but they only worked once and never after that.
Hence, the SetInterval method had to be used to scan the page once every second. A picture is included in this Repo that shows performance results for 1ms interval testing. 
Freshservice API rate limit = 1000/hour, but testing showed accurate results despite possibly exceeding this limit.
