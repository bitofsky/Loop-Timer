"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    $('TopNavigation .collapse, TopNavigation .dropdown')
        .on('shown.bs.collapse hidden.bs.collapse shown.bs.dropdown hidden.bs.dropdown', () => $(window).trigger('resize'));
};
//# sourceMappingURL=template.js.map