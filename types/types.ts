export interface Workspace {
    _id: string;
    name: string;
    members: string[];
}

export interface Channel {
    _id: string;
    name: string;
    workspace: {
        _id: string;
        name: string;
        members: [
            {
                _id: string;
                name: string;
                email: string;
                status: "offline" | "online";
                role: "user" | "admin"
            }
        ]
    };
}

export interface Message {
  _id: string;
  channel: string;
  sender: {
    _id: string;
    name: string;
  };
  content: string;
  createdAt?: string; // ISO date from API
}