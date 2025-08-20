document.addEventListener("DOMContentLoaded", function () {
  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: ["dayGrid"],
    defaultView: "dayGridMonth",

    // Render tooltip and event styling
    eventRender: function (info) {
      const ntoday = moment().format("YYYYMMDD");
      const eventStart = moment(info.event.start).format("YYYYMMDD");

      info.el.setAttribute("title", info.event.extendedProps.description || "");
      info.el.setAttribute("data-toggle", "tooltip");

      if (eventStart < ntoday) {
        info.el.classList.add("fc-past-event");
      } else if (eventStart === ntoday) {
        info.el.classList.add("fc-current-event");
      } else {
        info.el.classList.add("fc-future-event");
      }
    },

    // Fetch events from backend
    events: function (fetchInfo, successCallback, failureCallback) {
      fetch("/admin/events")
        .then((res) => res.json())
        .then((data) => {
          // Map backend events to FullCalendar format
          const events = data.map((ev) => ({
            id: ev.id,
            title: ev.title,
            start: ev.start, // ISO string from your controller
            description: ev.description || "",
          }));
          successCallback(events);
        })
        .catch((err) => {
          console.error("Error fetching events:", err);
          failureCallback(err);
        });
    },
  });

  calendar.render();
});
