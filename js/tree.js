var layoutInfo = {
    startTab: "none",
    startNavTab: "tree-tab",
	showTree: true,

    // add layers/nodes to treeLayout to place onto tree-tab
    treeLayout: [
        ["p", "s", "e"],
        ["sys", "blank", "blank", "blank", "blank"]
    ]

}

// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
    row: 1,
    position: 1
}
)

addLayer("tree-tab", {
    tabFormat: [
        ["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]
    ],
    previousTab: "",
    leftTab: true,
})