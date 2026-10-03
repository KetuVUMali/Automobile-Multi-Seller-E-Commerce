/*!
 * OurtAuto — notifications.js
 * Header notification dropdown interactions.
 */
(function () {
  "use strict";
  document.addEventListener("click", function (e) {
    if (e.target.closest(".mark-all-read-btn")) {
      document.querySelectorAll(".ourt-notif-item.unread").forEach(function (n) { n.classList.remove("unread"); });
      var badge = document.querySelector(".notif-bell-badge");
      if (badge) badge.remove();
      window.OurtToast && window.OurtToast.show("All notifications marked as read.", "success");
    }
  });
})();
