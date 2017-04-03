export default () => {
    $('TopNavigation .collapse, TopNavigation .dropdown')
        .on('shown.bs.collapse hidden.bs.collapse shown.bs.dropdown hidden.bs.dropdown', () => $(window).trigger('resize'));
};
