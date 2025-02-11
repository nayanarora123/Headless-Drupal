import React, { useEffect, useState } from "react";
import { fetchArticles, createArticle, updateArticle, deleteArticle } from "../services/drupalAPI";

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  useEffect(() => {
    fetchArticles().then(setArticles);
  }, []);

  const handleCreate = async () => {
    await createArticle(newTitle, newBody);
    fetchArticles().then(setArticles);
    setNewTitle("");
    setNewBody("");
  };

  const handleUpdate = async () => {
    if (!editId) return;
    await updateArticle(editId, editTitle, editBody);
    fetchArticles().then(setArticles);
    setEditId(null);
    setEditTitle("");
    setEditBody("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      await deleteArticle(id);
    //   setArticles(articles.filter(a => a.id !== id));
    fetchArticles().then(setArticles);
    }
  };
  
  return (
    <div>
      <h1>Drupal Articles (CRUD)</h1>

      {/* Create Article */}
      <h2>Create Article</h2>
      <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title" />
      <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="Body"></textarea>
      <button onClick={handleCreate}>Create</button>

      {/* Edit Article */}
      {editId && (
        <>
          <h2>Edit Article</h2>
          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)}></textarea>
          <button onClick={handleUpdate}>Update</button>
          <button onClick={() => setEditId(null)}>Cancel</button>
        </>
      )}

      {/* Articles Table */}
      <table border="1" cellPadding="10" cellSpacing="0" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Body</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td>{article.id}</td>
              <td>{article.title}</td>
              <td dangerouslySetInnerHTML={{ __html: article.body }} />
              <td>
                {article.imageUrl ? (
                  <img src={article.imageUrl} alt={article.title} style={{ width: "100px", height: "auto" }} />
                ) : (
                  "No Image"
                )}
              </td>
              <td>
                <button onClick={() => { setEditId(article.id); setEditTitle(article.title); setEditBody(article.body); }}>Edit</button>
                <button onClick={() => handleDelete(article.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Articles;
