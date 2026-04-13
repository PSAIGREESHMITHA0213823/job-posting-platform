import React, { useEffect, useState } from "react";
import axios from "axios";

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const userId = 1; 
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/company/users",
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const loadMessages = async (receiverId) => {
    setSelectedUser(receiverId);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/company/chat/messages/${receiverId}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const sendMessage = async () => {
    if (!text || !selectedUser) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/company/chat/send",
        {
          receiver_id: selectedUser,
          content: text,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      setMessages([...messages, res.data]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", height: "90vh", background: "#f5f7fb" }}>

      <div style={{
        width: "320px",
        background: "#fff",
        borderRight: "1px solid #e0e0e0",
        padding: "10px"
      }}>
        <h3 style={{ marginBottom: 10 }}>Chats</h3>

        {users.map(user => (
          <div
            key={user.id}
            onClick={() => loadMessages(user.id)}
            style={{
              padding: "10px",
              borderRadius: 10,
              cursor: "pointer",
              marginBottom: 5,
              background:
                selectedUser === user.id ? "#e8f0fe" : "transparent"
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {user.full_name}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {user.email}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#f9fafc"
      }}>
        
        {!selectedUser ? (
          <div style={{ margin: "auto", textAlign: "center" }}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
              width={120}
              alt="empty"
            />
            <h3>No conversation selected</h3>
            <p style={{ color: "#666" }}>
              Select a chat to start messaging
            </p>
          </div>
        ) : (
          <>
            <div style={{
              padding: 10,
              borderBottom: "1px solid #ddd",
              background: "#fff"
            }}>
              <strong>
                {users.find(u => u.id === selectedUser)?.full_name}
              </strong>
            </div>

            <div style={{
              flex: 1,
              padding: 10,
              overflowY: "auto"
            }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    textAlign:
                      msg.sender_id === userId ? "right" : "left",
                    marginBottom: 10
                  }}
                >
                  <span style={{
                    background:
                      msg.sender_id === userId ? "#25D366" : "#eee",
                    color:
                      msg.sender_id === userId ? "#fff" : "#000",
                    padding: "6px 10px",
                    borderRadius: 10
                  }}>
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>
            <div style={{
              display: "flex",
              padding: 10,
              borderTop: "1px solid #ddd",
              background: "#fff"
            }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc"
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  marginLeft: 10,
                  padding: "8px 16px",
                  background: "#25D366",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Send
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ChatPage;