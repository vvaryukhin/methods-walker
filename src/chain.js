const registry = {};

const copy = o => ({ ...o });

export const create = (name, chain) => {
  if (registry.hasOwnProperty(name)) {
    throw `Name ${name} for middleware already used.`;
  }

  registry[name] = make(chain);
};

export const use = name => {
  return registry[name];
};

const make = chain => {
  let walker;

  const generator = function*(payload) {
    let index = 0;

    while (index < chain.length) {
      yield chain[index];
      index++;
    }
  };

  const next = payload => {
    let result;
    const { value: action, done } = walker.next(payload);

    if (action) {
      result = action.call(null, {
        payload: copy(payload),
        next,
        finished
      });
    }

    if (done) {
      callbacks.forEach(callback => callback.call(null, payload));
    }

    return result;
  };

  const callbacks = [];

  const start = async payload => {
    console.log("started with", { payload });

    walker = generator(payload);
    next(payload);

    finished(payload => {
      console.log("finished with", { payload });
    });
  };

  const finished = callback => {
    callbacks.push(callback);
  };

  return { start, finished };
};
