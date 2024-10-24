import {PreviewInterface} from "Magento_PageBuilder/js/content-type/preview.types";
import * as html2canvas from "html2canvas";
import $t from "mage/translate";
import $ from 'jquery';
import Config from "Magento_PageBuilder/js/config";
import {TemplateSavePreviewDataInterface} from "Boundsoff_PageBuilderTemplateInline/js/template-inline-manager.types";
import registry from "uiRegistry";
// @ts-ignore
import alertDialog from 'Magento_PageBuilder/js/modal/confirm-alert';
// @ts-ignore
import templateManagerSave from "Magento_PageBuilder/js/modal/template-manager-save";
// @ts-ignore
import promptContentTmpl from 'text!Magento_PageBuilder/template/modal/template-manager/save-content-modal.html';

type TemplateSaveResponse = { success: boolean, message?: String }

export default class TemplateInlineManager {
    public static createCapture(preview: PreviewInterface): Html2CanvasPromise<String> {
        const element = preview.wrapperElement as HTMLElement;

        const stageElement = document.getElementById(preview.contentType.stageId);
        stageElement.classList.add('capture');
        stageElement.classList.add('interacting');

        return html2canvas(element, {
            scale: 1,
            useCORS: true,
        })
            .then(canvas => {
                stageElement.classList.remove('capture');
                stageElement.classList.remove('interacting');

                return canvas.toDataURL('image/jpeg', 0.85);
            })
            .catch(error => {
                stageElement.classList.remove('capture');
                stageElement.classList.remove('interacting');

                console.error(error);
                return '';
            })
    }

    public static saveAs(preview: PreviewInterface, component_data: TemplateSavePreviewDataInterface) {
        const capture = TemplateInlineManager.createCapture(preview);

        // noinspection JSVoidFunctionReturnValueUsed
        const prompt = templateManagerSave({
            title: $t("Save Block as Template"),
            promptContentTmpl,
            templateTypes: Config.getConfig("stage_config").template_types,
            createdForNote: $t("Created For is to help with filtering templates. This does not restrict where this template can be used."),
            typeLabel: $t("Created For"),
            label: $t("Template Name"),
            validation: true,
            modalClass: "template-manager-save",
            validationRules: ["required-entry"],
            attributesForm: {
                novalidate: "novalidate",
                action: "",
            },
            attributesField: {
                "name": "name",
                "data-validate": "{required:true}",
                "maxlength": "255",
            },
            actions: {
                confirm(name: string, created_for: string) {
                    return capture
                        .then(preview_image => {
                            const requestUrl = new URL(Config.getConfig('bf__template_save_url'));
                            const requestData = {name, created_for, component_data, preview_image};

                            return $.ajax({
                                method: 'POST',
                                url: requestUrl.toString(),
                                data: requestData,
                                dataType: 'json',
                            })
                        })
                        .then((response: TemplateSaveResponse) => {
                            if (!response.success) {
                                throw new Error(response.message?.toString() || 'Unknown error');
                            }

                            alertDialog({
                                content: $t("Block has been successfully saved as a template."),
                                title: $t("Template Saved"),
                            });
                            TemplateInlineManager.refreshGrid()
                        })
                        .catch(error => {
                            alertDialog({
                                content: error.message || $t("An issue occurred while attempting to save " +
                                    "the template, please try again."),
                                title: $t("An error occurred"),
                            });

                            throw error;
                        })
                },
            },
        })

        capture.then(imageEncoded => {
            // @ts-ignore
            prompt.templateManagerSave("setPreviewImage", imageEncoded);
        });
    }

    protected static refreshGrid() {
        const templateStageGrid = registry
            .get("pagebuilder_stage_template_grid.pagebuilder_stage_template_grid_data_source");

        if (templateStageGrid) {
            templateStageGrid.storage().clearRequests();
            templateStageGrid.reload();
        }
    }
}
