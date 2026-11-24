import { postCard } from "../components/post-card";
import { posts } from "../content/posts";
import { h } from "../core/dom";
import { icon } from "../core/icons";
import { mount } from "../core/layout";

mount(
  h(
    "section",
    { class: "container section center notfound" },
    h("p", { class: "notfound-code" }, "404"),
    h("h1", null, "This page drifted off the network"),
    h("p", { class: "lead" }, "The page you were looking for doesn't exist or has moved."),
    h(
      "div",
      { class: "hero-actions center" },
      h("a", { class: "btn btn-primary", href: "/", html: `${icon("arrowLeft", 18)}<span>Back home</span>` }),
      h("a", { class: "btn btn-ghost", href: "/posts.html" }, "Browse articles"),
    ),
  ),
  h("section", { class: "container section-tight" }, h("h2", { class: "related-title" }, "Popular articles"), h("div", { class: "card-grid" }, posts.slice(0, 3).map((p) => postCard(p)))),
);
