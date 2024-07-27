/* global Fuse */
const fuseOptions = {
    keys: [
        { name: 'title', weight: 3 },
        { name: 'path', weight: 1 },
        { name: 'url', weight: 1 },
    ], // 'title', 'url', 'path'],
    threshold: 0.5,
    useExtendedSearch: true,
    shouldSort: true,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 3,
}
let bookmarksList = []
let fuse

// function displayResults(results, location) {
//     /**
//      * @param {Array.<BookmarkTreeNode>} results - The BookmarkTreeNodes to render in the UI
//      * @param {string} location - The CSS selector of the UI container in which to render
//      * @requires module:jquery
//      */
//     $(location).empty()
//     const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' }
//     const dateTimeFormat = new Intl.DateTimeFormat('pl-PL', dateOptions)
//     const resultNodes = results.map((res) => {
//         console.log(res)
//         const score = (100.0 * res.score).toFixed(2)
//         const title = res.item.title
//         const path = res.item.path
//         const url = res.item.url
//         const date = new Date(res.item.dateAdded)
//         const bookmarkDate = dateTimeFormat.format(date)
//         const resElem = `
//             <li class="list-group-item" title="${url}">
//                 <a href="${url}" target="_blank" class="card-link">
//                     <div class="card-title">${title}</div>
//                 </a>
//                     <div class="card-footer text-muted">Score:&ensp;${score}&ensp;Bokmarked:&ensp;${bookmarkDate}&ensp;Path:&ensp;${path}</div>
//             </li>
//         `
//         return $(resElem)
//     })
//     $(location).append(resultNodes)
// }
//
function displayResults2(results, location) {
    var html = ''
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' }
    const dateTimeFormat = new Intl.DateTimeFormat('pl-PL', dateOptions)
    for (let i = 0; i < results.length; i++) {
        let res = results[i]
        const score = (100.0 * res.score).toFixed(2)
        const title = res.item.title
        const path = res.item.path
        const url = res.item.url
        const date = new Date(res.item.dateAdded)
        const bookmarkDate = dateTimeFormat.format(date)
        html += `
        <li class="list-group-item" title="${url}">
                <a href="${url}" target="_blank" class="card-link">
                    <div class="card-title">${title}</div>
                </a>
                <div class="card-footer text-muted">Score:&ensp;${score}&ensp;Bokmarked:&ensp;${bookmarkDate}&ensp;Path:&ensp;${path}</div>
       </li>
       `
    }
    document.getElementById(location).innerHTML = html
}

function flattenArray(arr) {
    /**
     * Return a flattened array without any children
     * @param {Array.<BookmarkTreeNode>} arr - BookmarkTreeNodes with children
     * @param {Array.<BookmarkTreeNode>} arr.children - BookmarkTreeNodes with children
     * @returns {Array.<BookmarkTreeNode>}
     */
    let tempPtr = arr
    while (tempPtr.some((node) => node.hasOwnProperty('children'))) {
        tempPtr = tempPtr.reduce((acc, curr) => {
            if (curr.hasOwnProperty('children')) {
                return acc.concat(curr.children)
            } else {
                return acc.concat([curr])
            }
        }, [])
    }

    return tempPtr
}

function initNodePaths(parent, parentPath) {
    /**
     * Recursively create a path attribute for every child node in the tree whose root is @parent
     * @param {BookmarkTreeNode} parent - The node whose path will be given to its children
     * @param {string} parentPath - The path to give to
     */
    parent.children.forEach((child) => {
        child.path = parentPath
        if (child.hasOwnProperty('children')) {
            child.path += `${child.title}/`
            initNodePaths(child, child.path)
        }
    })
}

// initialise Fuse instance
chrome.bookmarks.getTree((results) => {
    // console.log(results)
    // const bookmarks = results[0].children.find((child) => child.title === 'Other Bookmarks')
    const bookmarks = results[0] // Also Bookmarks Bar
    // console.log(bookmarks)
    initNodePaths(bookmarks, '')
    bookmarksList = flattenArray(bookmarks.children)
    fuse = new Fuse(bookmarksList, fuseOptions)
})

$('#search-input').on('input', function () {
    const query = $(this).val()
    if (query.length > 3) {
        const results = fuse.search(query)
        if (results.length > 0) {
            $('body').addClass('res-present') // resize popup
            displayResults2(results, 'results')
        } else {
            $('body').removeClass('res-present')
        }
    } else {
        $('.result-box').empty()
        $('body').removeClass('res-present')
    }
})

$(document).ready(function () {
    $('#search-input').focus()
})
