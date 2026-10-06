const meta = {
    index: {
        display: 'hidden'
    },
    // Order matches the index page's own "All Projects" list — finished
    // work first, consistent with its deliberate finished-vs-in-progress
    // hierarchy (which the sidebar was previously contradicting).
    laylocafe: {
        title: 'Laylo Cafe',
        type: 'doc'
    },
    maskimumcarnage: {
        title: 'Maskimum Carnage',
        type: 'doc'
    },
    equaljusticestudios: {
        title: 'Equal Justice Studios',
        type: 'doc'
    },
    boycott1902: {
        title: 'Boycott 1902',
        type: 'doc'
    },
    personalportfolio: {
        title: 'Personal Portfolio',
        type: 'doc'
    },
    tictactoe: {
        title: 'Tic Tac Toe',
        type: 'doc'
    },
    // Thin stubs — intentionally hidden from navigation until they have
    // real substance (see PRODUCT.md).
    securechatapp: {
        display: 'hidden'
    },
    raspberrypi: {
        display: 'hidden'
    },
    riftrewind: {
        display: 'hidden'
    },
    // Last, not first — matches the index page's own "Also in progress"
    // demotion of WIP below finished work.
    wip: {
        title: 'Work In Progress',
        type: 'doc'
    },
}

export default meta;