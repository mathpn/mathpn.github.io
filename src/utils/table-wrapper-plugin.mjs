import { visit } from "unist-util-visit";

export default function rehypeWrapTables() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      // Handle table wrapping
      if (node.tagName === "table") {
        const wrapper = {
          type: "element",
          tagName: "div",
          properties: {
            className: ["table-wrapper"],
          },
          children: [node],
        };

        if (parent) {
          parent.children[index] = wrapper;
        }
      }

      // Handle cell alignment
      if (node.tagName === "td" || node.tagName === "th") {
        const align = node.properties.align;
        if (align) {
          // Convert align attribute to Tailwind class
          const alignClass = {
            left: "text-left",
            right: "text-right",
            center: "text-center",
          }[align];

          // Remove the align attribute
          delete node.properties.align;

          // Add Tailwind class
          node.properties.className = node.properties.className || [];
          if (Array.isArray(node.properties.className)) {
            node.properties.className.push(alignClass);
          } else {
            node.properties.className = [alignClass];
          }
        }
      }
    });
  };
}
