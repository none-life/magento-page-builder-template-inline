<?php

namespace Boundsoff\PageBuilderTemplateInline\Plugin;

use Boundsoff\PageBuilderTemplateInline\Model\ConfigAcl;
use Magento\Framework\AuthorizationInterface;
use Magento\Framework\UrlInterface;

class StageConfig
{
    const ROUTE_PATH = 'Boundsoff_PageBuilderTemplateInline/template/save';

    public function __construct(
        protected readonly UrlInterface $urlBuilder,
        protected readonly AuthorizationInterface $authorization,
    ) {
    }

    /**
     * @param \Magento\PageBuilder\Model\Stage\Config $subject
     * @param array $result
     * @return array
     * @see \Magento\PageBuilder\Model\Stage\Config::getConfig
     */
    public function afterGetConfig($subject, $result)
    {
        $result['bf__template_save_url'] = $this->urlBuilder->getUrl(static::ROUTE_PATH);

        foreach (ConfigAcl::cases() as $case) {
            $result['acl'][strtolower($case->name)] = $this->authorization->isAllowed($case->value);
        }

        return $result;
    }
}
