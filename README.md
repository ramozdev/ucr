# UCR

UCR stands for Update, Create, Remove. The `ucr` package contains functions to transform a form's state into its `create`, `update`, and `remove` parts.

There are two main benefits to following the UCR convention:

1. Only the data that has changed is sent to the backend. This reduces the amount of data sent over the network and improves performance.

2. The backend is simplified because it only requires `create`, `remove` and `update` functions which can even be shared in different forms containing the same tables. This approach makes the backend less prone to errors.

Thus, the UCR convention simplifies the backend code, improves performance and reliability.

## Installation

To start using `ucr`, install it in your project:

```ts
pnpm i ucr
```

## The convention

The following is an example of the output returned by the `getUCR` function:

```json
{
  "update": {
    "tableA": [
      {
        "id": 123,
        "columnB": "value2"
      }
    ],
    "tableB": [
      {
        "id": 789,
        "columnB": "abc",
        "columnC": true
      }
    ]
  },
  "create": {
    "tableA": [],
    "tableB": [
      {
        "columnB": "xyz",
        "columnC": false
      }
    ]
  },
  "remove": {
    "tableA": [],
    "tableB": [4, 342, 22]
  }
}
```

The UCR convention is tied to the SQL database structure and it has three parts:

- `update`: The data to be updated in the database. The `update` object contains a key for each table to be updated. Each table key contains an array of objects to be updated. Each object must have an `id` used to find the row in the table. The rest of the keys are the columns to be updated.

- `create`: The data to be created in the database. The `create` object contains a key for each table to be created. Each table contains an array of objects to be created. Each object contains the columns to be created.

- `remove`: The data to be removed from the database. The `remove` object contains a key for each table to be modified. Each table contains an array of `id`s to be removed.

### UCRObject

The UCR Form is comprised of UCR objects, which are assigned to `<input/>` elements.

The `key` is the name of the column in the database. Each UCR object must have an `action` and `value` key. The `action` key is a string that describes the action to be taken on the item. The `value` key is the value to be inserted into the database.

```ts
type UcrObject = {
  [key: string]: {
    action: "" | "CREATE" | "UPDATE" | "REMOVE" | "ID";
    value: string | boolean;
  };
};
```

Note: We don't use the word `delete` because it is a reserved word in JavaScript.

### Actions

- `""`: No action. This value is assigned by default to items fetched from the database.
- `"CREATE"`: Create a new row in the database. If any item in a `UcrObject` has this action, the entire object will be created. You may omit the `"ID"` key if you are creating a new object.
- `"UPDATE"`: Update a row in the database. If any item in a `UcrObject` has this action, the entire object will be updated. There must be a key with the action `"ID"` in order to update an object.
- `"REMOVE"`: Delete a row in the database. If any item in a `UcrObject` has this action, the entire object will be deleted. There must be a key with the action `"ID"` in order to delete an object.
- `"ID"`: The ID for a row. This item is required for `"UPDATE"` and `"REMOVE"` actions.

### Example

In this example we have a todo list with a `name` and `description`. The todo list has tasks that have a `name` and a `completed` status.

```json
{
  "todo": {
    "todoId": {
      "action": "ID",
      "value": "12"
    },
    "name": {
      "action": "",
      "value": "Shopping List"
    },
    "description": {
      "action": "",
      "value": ""
    }
  },
  "tasks": [
    {
      "taskId": {
        "action": "ID",
        "value": "3"
      },
      "name": {
        "action": "",
        "value": "egg"
      },
      "completed": {
        "action": "",
        "value": false
      }
    },
    {
      "taskId": {
        "action": "ID",
        "value": "4"
      },
      "name": {
        "action": "",
        "value": "Ham"
      },
      "completed": {
        "action": "",
        "value": false
      }
    }
  ]
}
```

In this example we are updating the todo list name and description, updating the task name and completed status, deleting the task with id 4, and creating a new task.

```json
{
  "todo": {
    "todoId": {
      "action": "ID",
      "value": "12"
    },
    "name": {
      "action": "UPDATE",
      "value": "Shopping"
    },
    "description": {
      "action": "UPDATE",
      "value": "These are the things that I must buy."
    }
  },
  "tasks": [
    {
      "taskId": {
        "action": "ID",
        "value": "3"
      },
      "name": {
        "action": "UPDATE",
        "value": "Eggs"
      },
      "completed": {
        "action": "UPDATE",
        "value": true
      }
    },
    {
      "taskId": {
        "action": "ID",
        "value": "4"
      },
      "name": {
        "action": "REMOVE",
        "value": "Ham"
      },
      "completed": {
        "action": "",
        "value": false
      }
    },
    {
      "taskId": {
        "action": "CREATE",
        "value": ""
      },
      "name": {
        "action": "CREATE",
        "value": "Potatoes"
      },
      "completed": {
        "action": "CREATE",
        "value": false
      }
    }
  ]
}
```

We propose providing a set of functions which can be used to generate a payload object to be sent to the backend.

```ts
import { getUCR } from "ucr";
// the `todo` and `tasks` objects come from your form
const payload = getUCR({
  todos: [todo],
  tasks,
});
```

This object will be parsed by the `ucr` functions and return the following object:

```json
{
  "update": {
    "todos": [
      {
        "todoId": "12",
        "name": "Shopping",
        "description": "These are the things that I must buy."
      }
    ],
    "tasks": [
      {
        "taskId": "3",
        "name": "Eggs",
        "completed": true
      }
    ]
  },
  "create": {
    "todos": [],
    "tasks": [
      {
        "name": "Potatoes",
        "completed": false
      }
    ]
  },
  "remove": {
    "todos": [],
    "tasks": [4]
  }
}
```
