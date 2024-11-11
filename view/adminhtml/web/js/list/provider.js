define([
    'Magento_Ui/js/grid/provider',
    'Magento_Ui/js/modal/alert',
    'uiRegistry',
    'Magento_PageBuilder/js/events',
    'Magento_PageBuilder/js/acl',
    'Boundsoff_PageBuilderTemplateInline/js/actions/url-build',
    'Boundsoff_PageBuilderTemplateInline/js/acl',
], function (Provider, alertDialog, registry, events, acl, urlBuild, aclBf) {
    'use strict';

    return Provider.extend({
        initialize() {
            this._super();

            events.on('templates:save:successful', () => {
                this.clearData()
                    .reload({refresh: true});
            });

            return this;
        },

        onDelete(target, recordId) {
            const eventParams = {provider: this, arguments, shouldContinue: true};
            events.trigger('templates:delete:before', eventParams);
            if (!eventParams.shouldContinue) {
                return;
            }

            if (!acl.isAllowed(aclBf.resources.TEMPLATE_INLINE_DELETE)) {
                alertDialog({
                    content: $t("You do not have permission to apply templates."),
                    title: $t("Permission Error"),
                });
                return;
            }

            const url = urlBuild(`bf-pb-template-inline/template/delete/id/${recordId}`);
            fetch(url)
                .then(() => {
                    this.clearData()
                        .reload({refresh: true});

                    events.trigger('templates:delete:after', {provider: this, arguments});
                });
        },
    });
});
