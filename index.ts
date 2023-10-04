export type UcrObject = Record<
  string,
  {
    action: "" | "CREATE" | "UPDATE" | "REMOVE" | "ID";
    value: string | boolean;
  }
>;

export function getUCR(ucrObjects: Record<string, UcrObject[]>) {
  const update = Object.entries(ucrObjects).reduce<
    Record<string, ReturnType<typeof getUpdatedItems>>
  >((acc, [key, value]) => {
    acc[key] = getUpdatedItems(value);
    return acc;
  }, {});
  const create = Object.entries(ucrObjects).reduce<
    Record<string, ReturnType<typeof getCreatedItems>>
  >((acc, [key, value]) => {
    acc[key] = getCreatedItems(value);
    return acc;
  }, {});
  const remove = Object.entries(ucrObjects).reduce<
    Record<string, ReturnType<typeof getRemovedItems>>
  >((acc, [key, value]) => {
    acc[key] = getRemovedItems(value);
    return acc;
  }, {});

  return {
    update,
    create,
    remove,
  };
}

export function getUpdatedItems(array: UcrObject[]) {
  return array
    .filter((object) =>
      Object.values(object).some(({ action }) => action === "UPDATE")
    )
    .map((object) => {
      return Object.entries(object).reduce<Record<string, string | boolean>>(
        (acc, [key, item]) => {
          if (item.action === "UPDATE" || item.action === "ID") {
            acc[key] = item.value;
          }
          return acc;
        },
        {}
      );
    });
}

export function getRemovedItems(array: UcrObject[]) {
  return array
    .filter((object) =>
      Object.values(object).some(({ action }) => action === "REMOVE")
    )
    .map((object) =>
      Object.values(object).reduce<string | boolean>((acc, item) => {
        if (item.action === "ID") {
          acc = item.value;
        }
        return acc;
      }, "")
    );
}

export function getCreatedItems(array: UcrObject[]) {
  return array
    .filter((object) => {
      return Object.values(object).some(({ action }) => action === "CREATE");
    })
    .map((object) =>
      Object.entries(object).reduce<Record<string, string | boolean>>(
        (acc, [key, item]) => {
          if (item.action === "CREATE") {
            acc[key] = item.value;
          }
          return acc;
        },
        {}
      )
    );
}
