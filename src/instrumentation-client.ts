import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      path: "/api/forms/contact/",
      method: "POST",
    },
    {
      path: "/api/forms/referral/",
      method: "POST",
    },
  ],
});
