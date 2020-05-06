import { use as useChain, create as createChain } from "./chain";
import { redirect } from "./location";

const validate = ({ payload, next }) => {
  if (!payload.username) throw "Username required.";

  payload.validated = true;

  console.log("✔️", "validated");
  next(payload);
};

const send = async ({ payload, next, finished }) => {
  console.log("🕛", "sending...", { payload });

  setTimeout(async () => {
    payload.sended = true;
    console.log("✔️", "sended", { payload });

    next(payload);

    finished(payload => {
      console.log(
        "do some things after main process from 'send' function with finally payload",
        payload
      );
    });
  }, 5000);
};

const shopPopup = ({ delay }) => async ({ payload, next }) => {
  console.log("🕛", "showing...", { payload });

  setTimeout(() => {
    payload.showed = true;
    console.log("✔️", "popup showed", { payload });
    next(payload);
  }, delay * 1000);
};

const goTo = path => ({ payload, next }) => {
  payload.redirected = true;
  console.log("✔️", "redirected", { payload });
  next(payload);
  redirect(path);
};

// Init new chain
createChain("checkout", [
  validate,
  send,
  shopPopup({ delay: 3 }),
  goTo("/thank-you")
]);

// Usage
const chain = useChain("checkout");
chain.start({ username: "Volodya" });

chain.finished(payload => {
  console.log("result", payload);
});
