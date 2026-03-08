import { useState } from "react";

export const AddUsers: React.FC<{}> = () => {
    const DEFAULT_USERS = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
  { id: "4", name: "Diana" },
  { id: "5", name: "Eve" },
  { id: "6", name: "Frank" }
];
    const [users, setUsers] = useState(DEFAULT_USERS);
}
