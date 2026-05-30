// Content for the cloudflare-deploy bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './cloudflare-deploy/SKILL.md'
import ref_references_agents_sdk_api_md from './cloudflare-deploy/references/agents-sdk/api.md'
import ref_references_agents_sdk_configuration_md from './cloudflare-deploy/references/agents-sdk/configuration.md'
import ref_references_agents_sdk_gotchas_md from './cloudflare-deploy/references/agents-sdk/gotchas.md'
import ref_references_agents_sdk_patterns_md from './cloudflare-deploy/references/agents-sdk/patterns.md'
import ref_references_agents_sdk_README_md from './cloudflare-deploy/references/agents-sdk/README.md'
import ref_references_ai_gateway_configuration_md from './cloudflare-deploy/references/ai-gateway/configuration.md'
import ref_references_ai_gateway_dynamic_routing_md from './cloudflare-deploy/references/ai-gateway/dynamic-routing.md'
import ref_references_ai_gateway_features_md from './cloudflare-deploy/references/ai-gateway/features.md'
import ref_references_ai_gateway_README_md from './cloudflare-deploy/references/ai-gateway/README.md'
import ref_references_ai_gateway_sdk_integration_md from './cloudflare-deploy/references/ai-gateway/sdk-integration.md'
import ref_references_ai_gateway_troubleshooting_md from './cloudflare-deploy/references/ai-gateway/troubleshooting.md'
import ref_references_ai_search_api_md from './cloudflare-deploy/references/ai-search/api.md'
import ref_references_ai_search_configuration_md from './cloudflare-deploy/references/ai-search/configuration.md'
import ref_references_ai_search_gotchas_md from './cloudflare-deploy/references/ai-search/gotchas.md'
import ref_references_ai_search_patterns_md from './cloudflare-deploy/references/ai-search/patterns.md'
import ref_references_ai_search_README_md from './cloudflare-deploy/references/ai-search/README.md'
import ref_references_analytics_engine_api_md from './cloudflare-deploy/references/analytics-engine/api.md'
import ref_references_analytics_engine_configuration_md from './cloudflare-deploy/references/analytics-engine/configuration.md'
import ref_references_analytics_engine_gotchas_md from './cloudflare-deploy/references/analytics-engine/gotchas.md'
import ref_references_analytics_engine_patterns_md from './cloudflare-deploy/references/analytics-engine/patterns.md'
import ref_references_analytics_engine_README_md from './cloudflare-deploy/references/analytics-engine/README.md'
import ref_references_api_api_md from './cloudflare-deploy/references/api/api.md'
import ref_references_api_configuration_md from './cloudflare-deploy/references/api/configuration.md'
import ref_references_api_gotchas_md from './cloudflare-deploy/references/api/gotchas.md'
import ref_references_api_patterns_md from './cloudflare-deploy/references/api/patterns.md'
import ref_references_api_README_md from './cloudflare-deploy/references/api/README.md'
import ref_references_api_shield_api_md from './cloudflare-deploy/references/api-shield/api.md'
import ref_references_api_shield_configuration_md from './cloudflare-deploy/references/api-shield/configuration.md'
import ref_references_api_shield_gotchas_md from './cloudflare-deploy/references/api-shield/gotchas.md'
import ref_references_api_shield_patterns_md from './cloudflare-deploy/references/api-shield/patterns.md'
import ref_references_api_shield_README_md from './cloudflare-deploy/references/api-shield/README.md'
import ref_references_argo_smart_routing_api_md from './cloudflare-deploy/references/argo-smart-routing/api.md'
import ref_references_argo_smart_routing_configuration_md from './cloudflare-deploy/references/argo-smart-routing/configuration.md'
import ref_references_argo_smart_routing_gotchas_md from './cloudflare-deploy/references/argo-smart-routing/gotchas.md'
import ref_references_argo_smart_routing_patterns_md from './cloudflare-deploy/references/argo-smart-routing/patterns.md'
import ref_references_argo_smart_routing_README_md from './cloudflare-deploy/references/argo-smart-routing/README.md'
import ref_references_bindings_api_md from './cloudflare-deploy/references/bindings/api.md'
import ref_references_bindings_configuration_md from './cloudflare-deploy/references/bindings/configuration.md'
import ref_references_bindings_gotchas_md from './cloudflare-deploy/references/bindings/gotchas.md'
import ref_references_bindings_patterns_md from './cloudflare-deploy/references/bindings/patterns.md'
import ref_references_bindings_README_md from './cloudflare-deploy/references/bindings/README.md'
import ref_references_bot_management_api_md from './cloudflare-deploy/references/bot-management/api.md'
import ref_references_bot_management_configuration_md from './cloudflare-deploy/references/bot-management/configuration.md'
import ref_references_bot_management_gotchas_md from './cloudflare-deploy/references/bot-management/gotchas.md'
import ref_references_bot_management_patterns_md from './cloudflare-deploy/references/bot-management/patterns.md'
import ref_references_bot_management_README_md from './cloudflare-deploy/references/bot-management/README.md'
import ref_references_browser_rendering_api_md from './cloudflare-deploy/references/browser-rendering/api.md'
import ref_references_browser_rendering_configuration_md from './cloudflare-deploy/references/browser-rendering/configuration.md'
import ref_references_browser_rendering_gotchas_md from './cloudflare-deploy/references/browser-rendering/gotchas.md'
import ref_references_browser_rendering_patterns_md from './cloudflare-deploy/references/browser-rendering/patterns.md'
import ref_references_browser_rendering_README_md from './cloudflare-deploy/references/browser-rendering/README.md'
import ref_references_c3_api_md from './cloudflare-deploy/references/c3/api.md'
import ref_references_c3_configuration_md from './cloudflare-deploy/references/c3/configuration.md'
import ref_references_c3_gotchas_md from './cloudflare-deploy/references/c3/gotchas.md'
import ref_references_c3_patterns_md from './cloudflare-deploy/references/c3/patterns.md'
import ref_references_c3_README_md from './cloudflare-deploy/references/c3/README.md'
import ref_references_cache_reserve_api_md from './cloudflare-deploy/references/cache-reserve/api.md'
import ref_references_cache_reserve_configuration_md from './cloudflare-deploy/references/cache-reserve/configuration.md'
import ref_references_cache_reserve_gotchas_md from './cloudflare-deploy/references/cache-reserve/gotchas.md'
import ref_references_cache_reserve_patterns_md from './cloudflare-deploy/references/cache-reserve/patterns.md'
import ref_references_cache_reserve_README_md from './cloudflare-deploy/references/cache-reserve/README.md'
import ref_references_containers_api_md from './cloudflare-deploy/references/containers/api.md'
import ref_references_containers_configuration_md from './cloudflare-deploy/references/containers/configuration.md'
import ref_references_containers_gotchas_md from './cloudflare-deploy/references/containers/gotchas.md'
import ref_references_containers_patterns_md from './cloudflare-deploy/references/containers/patterns.md'
import ref_references_containers_README_md from './cloudflare-deploy/references/containers/README.md'
import ref_references_cron_triggers_api_md from './cloudflare-deploy/references/cron-triggers/api.md'
import ref_references_cron_triggers_configuration_md from './cloudflare-deploy/references/cron-triggers/configuration.md'
import ref_references_cron_triggers_gotchas_md from './cloudflare-deploy/references/cron-triggers/gotchas.md'
import ref_references_cron_triggers_patterns_md from './cloudflare-deploy/references/cron-triggers/patterns.md'
import ref_references_cron_triggers_README_md from './cloudflare-deploy/references/cron-triggers/README.md'
import ref_references_d1_api_md from './cloudflare-deploy/references/d1/api.md'
import ref_references_d1_configuration_md from './cloudflare-deploy/references/d1/configuration.md'
import ref_references_d1_gotchas_md from './cloudflare-deploy/references/d1/gotchas.md'
import ref_references_d1_patterns_md from './cloudflare-deploy/references/d1/patterns.md'
import ref_references_d1_README_md from './cloudflare-deploy/references/d1/README.md'
import ref_references_ddos_api_md from './cloudflare-deploy/references/ddos/api.md'
import ref_references_ddos_configuration_md from './cloudflare-deploy/references/ddos/configuration.md'
import ref_references_ddos_gotchas_md from './cloudflare-deploy/references/ddos/gotchas.md'
import ref_references_ddos_patterns_md from './cloudflare-deploy/references/ddos/patterns.md'
import ref_references_ddos_README_md from './cloudflare-deploy/references/ddos/README.md'
import ref_references_do_storage_api_md from './cloudflare-deploy/references/do-storage/api.md'
import ref_references_do_storage_configuration_md from './cloudflare-deploy/references/do-storage/configuration.md'
import ref_references_do_storage_gotchas_md from './cloudflare-deploy/references/do-storage/gotchas.md'
import ref_references_do_storage_patterns_md from './cloudflare-deploy/references/do-storage/patterns.md'
import ref_references_do_storage_README_md from './cloudflare-deploy/references/do-storage/README.md'
import ref_references_do_storage_testing_md from './cloudflare-deploy/references/do-storage/testing.md'
import ref_references_durable_objects_api_md from './cloudflare-deploy/references/durable-objects/api.md'
import ref_references_durable_objects_configuration_md from './cloudflare-deploy/references/durable-objects/configuration.md'
import ref_references_durable_objects_gotchas_md from './cloudflare-deploy/references/durable-objects/gotchas.md'
import ref_references_durable_objects_patterns_md from './cloudflare-deploy/references/durable-objects/patterns.md'
import ref_references_durable_objects_README_md from './cloudflare-deploy/references/durable-objects/README.md'
import ref_references_email_routing_api_md from './cloudflare-deploy/references/email-routing/api.md'
import ref_references_email_routing_configuration_md from './cloudflare-deploy/references/email-routing/configuration.md'
import ref_references_email_routing_gotchas_md from './cloudflare-deploy/references/email-routing/gotchas.md'
import ref_references_email_routing_patterns_md from './cloudflare-deploy/references/email-routing/patterns.md'
import ref_references_email_routing_README_md from './cloudflare-deploy/references/email-routing/README.md'
import ref_references_email_workers_api_md from './cloudflare-deploy/references/email-workers/api.md'
import ref_references_email_workers_configuration_md from './cloudflare-deploy/references/email-workers/configuration.md'
import ref_references_email_workers_gotchas_md from './cloudflare-deploy/references/email-workers/gotchas.md'
import ref_references_email_workers_patterns_md from './cloudflare-deploy/references/email-workers/patterns.md'
import ref_references_email_workers_README_md from './cloudflare-deploy/references/email-workers/README.md'
import ref_references_hyperdrive_api_md from './cloudflare-deploy/references/hyperdrive/api.md'
import ref_references_hyperdrive_configuration_md from './cloudflare-deploy/references/hyperdrive/configuration.md'
import ref_references_hyperdrive_gotchas_md from './cloudflare-deploy/references/hyperdrive/gotchas.md'
import ref_references_hyperdrive_patterns_md from './cloudflare-deploy/references/hyperdrive/patterns.md'
import ref_references_hyperdrive_README_md from './cloudflare-deploy/references/hyperdrive/README.md'
import ref_references_images_api_md from './cloudflare-deploy/references/images/api.md'
import ref_references_images_configuration_md from './cloudflare-deploy/references/images/configuration.md'
import ref_references_images_gotchas_md from './cloudflare-deploy/references/images/gotchas.md'
import ref_references_images_patterns_md from './cloudflare-deploy/references/images/patterns.md'
import ref_references_images_README_md from './cloudflare-deploy/references/images/README.md'
import ref_references_kv_api_md from './cloudflare-deploy/references/kv/api.md'
import ref_references_kv_configuration_md from './cloudflare-deploy/references/kv/configuration.md'
import ref_references_kv_gotchas_md from './cloudflare-deploy/references/kv/gotchas.md'
import ref_references_kv_patterns_md from './cloudflare-deploy/references/kv/patterns.md'
import ref_references_kv_README_md from './cloudflare-deploy/references/kv/README.md'
import ref_references_miniflare_api_md from './cloudflare-deploy/references/miniflare/api.md'
import ref_references_miniflare_configuration_md from './cloudflare-deploy/references/miniflare/configuration.md'
import ref_references_miniflare_gotchas_md from './cloudflare-deploy/references/miniflare/gotchas.md'
import ref_references_miniflare_patterns_md from './cloudflare-deploy/references/miniflare/patterns.md'
import ref_references_miniflare_README_md from './cloudflare-deploy/references/miniflare/README.md'
import ref_references_network_interconnect_api_md from './cloudflare-deploy/references/network-interconnect/api.md'
import ref_references_network_interconnect_configuration_md from './cloudflare-deploy/references/network-interconnect/configuration.md'
import ref_references_network_interconnect_gotchas_md from './cloudflare-deploy/references/network-interconnect/gotchas.md'
import ref_references_network_interconnect_patterns_md from './cloudflare-deploy/references/network-interconnect/patterns.md'
import ref_references_network_interconnect_README_md from './cloudflare-deploy/references/network-interconnect/README.md'
import ref_references_observability_api_md from './cloudflare-deploy/references/observability/api.md'
import ref_references_observability_configuration_md from './cloudflare-deploy/references/observability/configuration.md'
import ref_references_observability_gotchas_md from './cloudflare-deploy/references/observability/gotchas.md'
import ref_references_observability_patterns_md from './cloudflare-deploy/references/observability/patterns.md'
import ref_references_observability_README_md from './cloudflare-deploy/references/observability/README.md'
import ref_references_pages_api_md from './cloudflare-deploy/references/pages/api.md'
import ref_references_pages_configuration_md from './cloudflare-deploy/references/pages/configuration.md'
import ref_references_pages_gotchas_md from './cloudflare-deploy/references/pages/gotchas.md'
import ref_references_pages_patterns_md from './cloudflare-deploy/references/pages/patterns.md'
import ref_references_pages_README_md from './cloudflare-deploy/references/pages/README.md'
import ref_references_pages_functions_api_md from './cloudflare-deploy/references/pages-functions/api.md'
import ref_references_pages_functions_configuration_md from './cloudflare-deploy/references/pages-functions/configuration.md'
import ref_references_pages_functions_gotchas_md from './cloudflare-deploy/references/pages-functions/gotchas.md'
import ref_references_pages_functions_patterns_md from './cloudflare-deploy/references/pages-functions/patterns.md'
import ref_references_pages_functions_README_md from './cloudflare-deploy/references/pages-functions/README.md'
import ref_references_pipelines_api_md from './cloudflare-deploy/references/pipelines/api.md'
import ref_references_pipelines_configuration_md from './cloudflare-deploy/references/pipelines/configuration.md'
import ref_references_pipelines_gotchas_md from './cloudflare-deploy/references/pipelines/gotchas.md'
import ref_references_pipelines_patterns_md from './cloudflare-deploy/references/pipelines/patterns.md'
import ref_references_pipelines_README_md from './cloudflare-deploy/references/pipelines/README.md'
import ref_references_pulumi_api_md from './cloudflare-deploy/references/pulumi/api.md'
import ref_references_pulumi_configuration_md from './cloudflare-deploy/references/pulumi/configuration.md'
import ref_references_pulumi_gotchas_md from './cloudflare-deploy/references/pulumi/gotchas.md'
import ref_references_pulumi_patterns_md from './cloudflare-deploy/references/pulumi/patterns.md'
import ref_references_pulumi_README_md from './cloudflare-deploy/references/pulumi/README.md'
import ref_references_queues_api_md from './cloudflare-deploy/references/queues/api.md'
import ref_references_queues_configuration_md from './cloudflare-deploy/references/queues/configuration.md'
import ref_references_queues_gotchas_md from './cloudflare-deploy/references/queues/gotchas.md'
import ref_references_queues_patterns_md from './cloudflare-deploy/references/queues/patterns.md'
import ref_references_queues_README_md from './cloudflare-deploy/references/queues/README.md'
import ref_references_r2_api_md from './cloudflare-deploy/references/r2/api.md'
import ref_references_r2_configuration_md from './cloudflare-deploy/references/r2/configuration.md'
import ref_references_r2_gotchas_md from './cloudflare-deploy/references/r2/gotchas.md'
import ref_references_r2_patterns_md from './cloudflare-deploy/references/r2/patterns.md'
import ref_references_r2_README_md from './cloudflare-deploy/references/r2/README.md'
import ref_references_r2_data_catalog_api_md from './cloudflare-deploy/references/r2-data-catalog/api.md'
import ref_references_r2_data_catalog_configuration_md from './cloudflare-deploy/references/r2-data-catalog/configuration.md'
import ref_references_r2_data_catalog_gotchas_md from './cloudflare-deploy/references/r2-data-catalog/gotchas.md'
import ref_references_r2_data_catalog_patterns_md from './cloudflare-deploy/references/r2-data-catalog/patterns.md'
import ref_references_r2_data_catalog_README_md from './cloudflare-deploy/references/r2-data-catalog/README.md'
import ref_references_r2_sql_api_md from './cloudflare-deploy/references/r2-sql/api.md'
import ref_references_r2_sql_configuration_md from './cloudflare-deploy/references/r2-sql/configuration.md'
import ref_references_r2_sql_gotchas_md from './cloudflare-deploy/references/r2-sql/gotchas.md'
import ref_references_r2_sql_patterns_md from './cloudflare-deploy/references/r2-sql/patterns.md'
import ref_references_r2_sql_README_md from './cloudflare-deploy/references/r2-sql/README.md'
import ref_references_realtimekit_api_md from './cloudflare-deploy/references/realtimekit/api.md'
import ref_references_realtimekit_configuration_md from './cloudflare-deploy/references/realtimekit/configuration.md'
import ref_references_realtimekit_gotchas_md from './cloudflare-deploy/references/realtimekit/gotchas.md'
import ref_references_realtimekit_patterns_md from './cloudflare-deploy/references/realtimekit/patterns.md'
import ref_references_realtimekit_README_md from './cloudflare-deploy/references/realtimekit/README.md'
import ref_references_realtime_sfu_api_md from './cloudflare-deploy/references/realtime-sfu/api.md'
import ref_references_realtime_sfu_configuration_md from './cloudflare-deploy/references/realtime-sfu/configuration.md'
import ref_references_realtime_sfu_gotchas_md from './cloudflare-deploy/references/realtime-sfu/gotchas.md'
import ref_references_realtime_sfu_patterns_md from './cloudflare-deploy/references/realtime-sfu/patterns.md'
import ref_references_realtime_sfu_README_md from './cloudflare-deploy/references/realtime-sfu/README.md'
import ref_references_sandbox_api_md from './cloudflare-deploy/references/sandbox/api.md'
import ref_references_sandbox_configuration_md from './cloudflare-deploy/references/sandbox/configuration.md'
import ref_references_sandbox_gotchas_md from './cloudflare-deploy/references/sandbox/gotchas.md'
import ref_references_sandbox_patterns_md from './cloudflare-deploy/references/sandbox/patterns.md'
import ref_references_sandbox_README_md from './cloudflare-deploy/references/sandbox/README.md'
import ref_references_secrets_store_api_md from './cloudflare-deploy/references/secrets-store/api.md'
import ref_references_secrets_store_configuration_md from './cloudflare-deploy/references/secrets-store/configuration.md'
import ref_references_secrets_store_gotchas_md from './cloudflare-deploy/references/secrets-store/gotchas.md'
import ref_references_secrets_store_patterns_md from './cloudflare-deploy/references/secrets-store/patterns.md'
import ref_references_secrets_store_README_md from './cloudflare-deploy/references/secrets-store/README.md'
import ref_references_smart_placement_api_md from './cloudflare-deploy/references/smart-placement/api.md'
import ref_references_smart_placement_configuration_md from './cloudflare-deploy/references/smart-placement/configuration.md'
import ref_references_smart_placement_gotchas_md from './cloudflare-deploy/references/smart-placement/gotchas.md'
import ref_references_smart_placement_patterns_md from './cloudflare-deploy/references/smart-placement/patterns.md'
import ref_references_smart_placement_README_md from './cloudflare-deploy/references/smart-placement/README.md'
import ref_references_snippets_api_md from './cloudflare-deploy/references/snippets/api.md'
import ref_references_snippets_configuration_md from './cloudflare-deploy/references/snippets/configuration.md'
import ref_references_snippets_gotchas_md from './cloudflare-deploy/references/snippets/gotchas.md'
import ref_references_snippets_patterns_md from './cloudflare-deploy/references/snippets/patterns.md'
import ref_references_snippets_README_md from './cloudflare-deploy/references/snippets/README.md'
import ref_references_spectrum_api_md from './cloudflare-deploy/references/spectrum/api.md'
import ref_references_spectrum_configuration_md from './cloudflare-deploy/references/spectrum/configuration.md'
import ref_references_spectrum_gotchas_md from './cloudflare-deploy/references/spectrum/gotchas.md'
import ref_references_spectrum_patterns_md from './cloudflare-deploy/references/spectrum/patterns.md'
import ref_references_spectrum_README_md from './cloudflare-deploy/references/spectrum/README.md'
import ref_references_static_assets_api_md from './cloudflare-deploy/references/static-assets/api.md'
import ref_references_static_assets_configuration_md from './cloudflare-deploy/references/static-assets/configuration.md'
import ref_references_static_assets_gotchas_md from './cloudflare-deploy/references/static-assets/gotchas.md'
import ref_references_static_assets_patterns_md from './cloudflare-deploy/references/static-assets/patterns.md'
import ref_references_static_assets_README_md from './cloudflare-deploy/references/static-assets/README.md'
import ref_references_stream_api_md from './cloudflare-deploy/references/stream/api.md'
import ref_references_stream_api_live_md from './cloudflare-deploy/references/stream/api-live.md'
import ref_references_stream_configuration_md from './cloudflare-deploy/references/stream/configuration.md'
import ref_references_stream_gotchas_md from './cloudflare-deploy/references/stream/gotchas.md'
import ref_references_stream_patterns_md from './cloudflare-deploy/references/stream/patterns.md'
import ref_references_stream_README_md from './cloudflare-deploy/references/stream/README.md'
import ref_references_tail_workers_api_md from './cloudflare-deploy/references/tail-workers/api.md'
import ref_references_tail_workers_configuration_md from './cloudflare-deploy/references/tail-workers/configuration.md'
import ref_references_tail_workers_gotchas_md from './cloudflare-deploy/references/tail-workers/gotchas.md'
import ref_references_tail_workers_patterns_md from './cloudflare-deploy/references/tail-workers/patterns.md'
import ref_references_tail_workers_README_md from './cloudflare-deploy/references/tail-workers/README.md'
import ref_references_terraform_api_md from './cloudflare-deploy/references/terraform/api.md'
import ref_references_terraform_configuration_md from './cloudflare-deploy/references/terraform/configuration.md'
import ref_references_terraform_gotchas_md from './cloudflare-deploy/references/terraform/gotchas.md'
import ref_references_terraform_patterns_md from './cloudflare-deploy/references/terraform/patterns.md'
import ref_references_terraform_README_md from './cloudflare-deploy/references/terraform/README.md'
import ref_references_tunnel_api_md from './cloudflare-deploy/references/tunnel/api.md'
import ref_references_tunnel_configuration_md from './cloudflare-deploy/references/tunnel/configuration.md'
import ref_references_tunnel_gotchas_md from './cloudflare-deploy/references/tunnel/gotchas.md'
import ref_references_tunnel_networking_md from './cloudflare-deploy/references/tunnel/networking.md'
import ref_references_tunnel_patterns_md from './cloudflare-deploy/references/tunnel/patterns.md'
import ref_references_tunnel_README_md from './cloudflare-deploy/references/tunnel/README.md'
import ref_references_turn_api_md from './cloudflare-deploy/references/turn/api.md'
import ref_references_turn_configuration_md from './cloudflare-deploy/references/turn/configuration.md'
import ref_references_turn_gotchas_md from './cloudflare-deploy/references/turn/gotchas.md'
import ref_references_turn_patterns_md from './cloudflare-deploy/references/turn/patterns.md'
import ref_references_turn_README_md from './cloudflare-deploy/references/turn/README.md'
import ref_references_turnstile_api_md from './cloudflare-deploy/references/turnstile/api.md'
import ref_references_turnstile_configuration_md from './cloudflare-deploy/references/turnstile/configuration.md'
import ref_references_turnstile_gotchas_md from './cloudflare-deploy/references/turnstile/gotchas.md'
import ref_references_turnstile_patterns_md from './cloudflare-deploy/references/turnstile/patterns.md'
import ref_references_turnstile_README_md from './cloudflare-deploy/references/turnstile/README.md'
import ref_references_vectorize_api_md from './cloudflare-deploy/references/vectorize/api.md'
import ref_references_vectorize_configuration_md from './cloudflare-deploy/references/vectorize/configuration.md'
import ref_references_vectorize_gotchas_md from './cloudflare-deploy/references/vectorize/gotchas.md'
import ref_references_vectorize_patterns_md from './cloudflare-deploy/references/vectorize/patterns.md'
import ref_references_vectorize_README_md from './cloudflare-deploy/references/vectorize/README.md'
import ref_references_waf_api_md from './cloudflare-deploy/references/waf/api.md'
import ref_references_waf_configuration_md from './cloudflare-deploy/references/waf/configuration.md'
import ref_references_waf_gotchas_md from './cloudflare-deploy/references/waf/gotchas.md'
import ref_references_waf_patterns_md from './cloudflare-deploy/references/waf/patterns.md'
import ref_references_waf_README_md from './cloudflare-deploy/references/waf/README.md'
import ref_references_web_analytics_configuration_md from './cloudflare-deploy/references/web-analytics/configuration.md'
import ref_references_web_analytics_gotchas_md from './cloudflare-deploy/references/web-analytics/gotchas.md'
import ref_references_web_analytics_integration_md from './cloudflare-deploy/references/web-analytics/integration.md'
import ref_references_web_analytics_patterns_md from './cloudflare-deploy/references/web-analytics/patterns.md'
import ref_references_web_analytics_README_md from './cloudflare-deploy/references/web-analytics/README.md'
import ref_references_workerd_api_md from './cloudflare-deploy/references/workerd/api.md'
import ref_references_workerd_configuration_md from './cloudflare-deploy/references/workerd/configuration.md'
import ref_references_workerd_gotchas_md from './cloudflare-deploy/references/workerd/gotchas.md'
import ref_references_workerd_patterns_md from './cloudflare-deploy/references/workerd/patterns.md'
import ref_references_workerd_README_md from './cloudflare-deploy/references/workerd/README.md'
import ref_references_workers_api_md from './cloudflare-deploy/references/workers/api.md'
import ref_references_workers_configuration_md from './cloudflare-deploy/references/workers/configuration.md'
import ref_references_workers_frameworks_md from './cloudflare-deploy/references/workers/frameworks.md'
import ref_references_workers_gotchas_md from './cloudflare-deploy/references/workers/gotchas.md'
import ref_references_workers_patterns_md from './cloudflare-deploy/references/workers/patterns.md'
import ref_references_workers_README_md from './cloudflare-deploy/references/workers/README.md'
import ref_references_workers_ai_api_md from './cloudflare-deploy/references/workers-ai/api.md'
import ref_references_workers_ai_configuration_md from './cloudflare-deploy/references/workers-ai/configuration.md'
import ref_references_workers_ai_gotchas_md from './cloudflare-deploy/references/workers-ai/gotchas.md'
import ref_references_workers_ai_patterns_md from './cloudflare-deploy/references/workers-ai/patterns.md'
import ref_references_workers_ai_README_md from './cloudflare-deploy/references/workers-ai/README.md'
import ref_references_workers_for_platforms_api_md from './cloudflare-deploy/references/workers-for-platforms/api.md'
import ref_references_workers_for_platforms_configuration_md from './cloudflare-deploy/references/workers-for-platforms/configuration.md'
import ref_references_workers_for_platforms_gotchas_md from './cloudflare-deploy/references/workers-for-platforms/gotchas.md'
import ref_references_workers_for_platforms_patterns_md from './cloudflare-deploy/references/workers-for-platforms/patterns.md'
import ref_references_workers_for_platforms_README_md from './cloudflare-deploy/references/workers-for-platforms/README.md'
import ref_references_workers_playground_api_md from './cloudflare-deploy/references/workers-playground/api.md'
import ref_references_workers_playground_configuration_md from './cloudflare-deploy/references/workers-playground/configuration.md'
import ref_references_workers_playground_gotchas_md from './cloudflare-deploy/references/workers-playground/gotchas.md'
import ref_references_workers_playground_patterns_md from './cloudflare-deploy/references/workers-playground/patterns.md'
import ref_references_workers_playground_README_md from './cloudflare-deploy/references/workers-playground/README.md'
import ref_references_workers_vpc_api_md from './cloudflare-deploy/references/workers-vpc/api.md'
import ref_references_workers_vpc_configuration_md from './cloudflare-deploy/references/workers-vpc/configuration.md'
import ref_references_workers_vpc_gotchas_md from './cloudflare-deploy/references/workers-vpc/gotchas.md'
import ref_references_workers_vpc_patterns_md from './cloudflare-deploy/references/workers-vpc/patterns.md'
import ref_references_workers_vpc_README_md from './cloudflare-deploy/references/workers-vpc/README.md'
import ref_references_workflows_api_md from './cloudflare-deploy/references/workflows/api.md'
import ref_references_workflows_configuration_md from './cloudflare-deploy/references/workflows/configuration.md'
import ref_references_workflows_gotchas_md from './cloudflare-deploy/references/workflows/gotchas.md'
import ref_references_workflows_patterns_md from './cloudflare-deploy/references/workflows/patterns.md'
import ref_references_workflows_README_md from './cloudflare-deploy/references/workflows/README.md'
import ref_references_wrangler_api_md from './cloudflare-deploy/references/wrangler/api.md'
import ref_references_wrangler_auth_md from './cloudflare-deploy/references/wrangler/auth.md'
import ref_references_wrangler_configuration_md from './cloudflare-deploy/references/wrangler/configuration.md'
import ref_references_wrangler_gotchas_md from './cloudflare-deploy/references/wrangler/gotchas.md'
import ref_references_wrangler_patterns_md from './cloudflare-deploy/references/wrangler/patterns.md'
import ref_references_wrangler_README_md from './cloudflare-deploy/references/wrangler/README.md'
import ref_references_zaraz_api_md from './cloudflare-deploy/references/zaraz/api.md'
import ref_references_zaraz_configuration_md from './cloudflare-deploy/references/zaraz/configuration.md'
import ref_references_zaraz_gotchas_md from './cloudflare-deploy/references/zaraz/gotchas.md'
import ref_references_zaraz_IMPLEMENTATION_SUMMARY_md from './cloudflare-deploy/references/zaraz/IMPLEMENTATION_SUMMARY.md'
import ref_references_zaraz_patterns_md from './cloudflare-deploy/references/zaraz/patterns.md'
import ref_references_zaraz_README_md from './cloudflare-deploy/references/zaraz/README.md'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'references/agents-sdk/api.md': ref_references_agents_sdk_api_md,
  'references/agents-sdk/configuration.md': ref_references_agents_sdk_configuration_md,
  'references/agents-sdk/gotchas.md': ref_references_agents_sdk_gotchas_md,
  'references/agents-sdk/patterns.md': ref_references_agents_sdk_patterns_md,
  'references/agents-sdk/README.md': ref_references_agents_sdk_README_md,
  'references/ai-gateway/configuration.md': ref_references_ai_gateway_configuration_md,
  'references/ai-gateway/dynamic-routing.md': ref_references_ai_gateway_dynamic_routing_md,
  'references/ai-gateway/features.md': ref_references_ai_gateway_features_md,
  'references/ai-gateway/README.md': ref_references_ai_gateway_README_md,
  'references/ai-gateway/sdk-integration.md': ref_references_ai_gateway_sdk_integration_md,
  'references/ai-gateway/troubleshooting.md': ref_references_ai_gateway_troubleshooting_md,
  'references/ai-search/api.md': ref_references_ai_search_api_md,
  'references/ai-search/configuration.md': ref_references_ai_search_configuration_md,
  'references/ai-search/gotchas.md': ref_references_ai_search_gotchas_md,
  'references/ai-search/patterns.md': ref_references_ai_search_patterns_md,
  'references/ai-search/README.md': ref_references_ai_search_README_md,
  'references/analytics-engine/api.md': ref_references_analytics_engine_api_md,
  'references/analytics-engine/configuration.md': ref_references_analytics_engine_configuration_md,
  'references/analytics-engine/gotchas.md': ref_references_analytics_engine_gotchas_md,
  'references/analytics-engine/patterns.md': ref_references_analytics_engine_patterns_md,
  'references/analytics-engine/README.md': ref_references_analytics_engine_README_md,
  'references/api/api.md': ref_references_api_api_md,
  'references/api/configuration.md': ref_references_api_configuration_md,
  'references/api/gotchas.md': ref_references_api_gotchas_md,
  'references/api/patterns.md': ref_references_api_patterns_md,
  'references/api/README.md': ref_references_api_README_md,
  'references/api-shield/api.md': ref_references_api_shield_api_md,
  'references/api-shield/configuration.md': ref_references_api_shield_configuration_md,
  'references/api-shield/gotchas.md': ref_references_api_shield_gotchas_md,
  'references/api-shield/patterns.md': ref_references_api_shield_patterns_md,
  'references/api-shield/README.md': ref_references_api_shield_README_md,
  'references/argo-smart-routing/api.md': ref_references_argo_smart_routing_api_md,
  'references/argo-smart-routing/configuration.md': ref_references_argo_smart_routing_configuration_md,
  'references/argo-smart-routing/gotchas.md': ref_references_argo_smart_routing_gotchas_md,
  'references/argo-smart-routing/patterns.md': ref_references_argo_smart_routing_patterns_md,
  'references/argo-smart-routing/README.md': ref_references_argo_smart_routing_README_md,
  'references/bindings/api.md': ref_references_bindings_api_md,
  'references/bindings/configuration.md': ref_references_bindings_configuration_md,
  'references/bindings/gotchas.md': ref_references_bindings_gotchas_md,
  'references/bindings/patterns.md': ref_references_bindings_patterns_md,
  'references/bindings/README.md': ref_references_bindings_README_md,
  'references/bot-management/api.md': ref_references_bot_management_api_md,
  'references/bot-management/configuration.md': ref_references_bot_management_configuration_md,
  'references/bot-management/gotchas.md': ref_references_bot_management_gotchas_md,
  'references/bot-management/patterns.md': ref_references_bot_management_patterns_md,
  'references/bot-management/README.md': ref_references_bot_management_README_md,
  'references/browser-rendering/api.md': ref_references_browser_rendering_api_md,
  'references/browser-rendering/configuration.md': ref_references_browser_rendering_configuration_md,
  'references/browser-rendering/gotchas.md': ref_references_browser_rendering_gotchas_md,
  'references/browser-rendering/patterns.md': ref_references_browser_rendering_patterns_md,
  'references/browser-rendering/README.md': ref_references_browser_rendering_README_md,
  'references/c3/api.md': ref_references_c3_api_md,
  'references/c3/configuration.md': ref_references_c3_configuration_md,
  'references/c3/gotchas.md': ref_references_c3_gotchas_md,
  'references/c3/patterns.md': ref_references_c3_patterns_md,
  'references/c3/README.md': ref_references_c3_README_md,
  'references/cache-reserve/api.md': ref_references_cache_reserve_api_md,
  'references/cache-reserve/configuration.md': ref_references_cache_reserve_configuration_md,
  'references/cache-reserve/gotchas.md': ref_references_cache_reserve_gotchas_md,
  'references/cache-reserve/patterns.md': ref_references_cache_reserve_patterns_md,
  'references/cache-reserve/README.md': ref_references_cache_reserve_README_md,
  'references/containers/api.md': ref_references_containers_api_md,
  'references/containers/configuration.md': ref_references_containers_configuration_md,
  'references/containers/gotchas.md': ref_references_containers_gotchas_md,
  'references/containers/patterns.md': ref_references_containers_patterns_md,
  'references/containers/README.md': ref_references_containers_README_md,
  'references/cron-triggers/api.md': ref_references_cron_triggers_api_md,
  'references/cron-triggers/configuration.md': ref_references_cron_triggers_configuration_md,
  'references/cron-triggers/gotchas.md': ref_references_cron_triggers_gotchas_md,
  'references/cron-triggers/patterns.md': ref_references_cron_triggers_patterns_md,
  'references/cron-triggers/README.md': ref_references_cron_triggers_README_md,
  'references/d1/api.md': ref_references_d1_api_md,
  'references/d1/configuration.md': ref_references_d1_configuration_md,
  'references/d1/gotchas.md': ref_references_d1_gotchas_md,
  'references/d1/patterns.md': ref_references_d1_patterns_md,
  'references/d1/README.md': ref_references_d1_README_md,
  'references/ddos/api.md': ref_references_ddos_api_md,
  'references/ddos/configuration.md': ref_references_ddos_configuration_md,
  'references/ddos/gotchas.md': ref_references_ddos_gotchas_md,
  'references/ddos/patterns.md': ref_references_ddos_patterns_md,
  'references/ddos/README.md': ref_references_ddos_README_md,
  'references/do-storage/api.md': ref_references_do_storage_api_md,
  'references/do-storage/configuration.md': ref_references_do_storage_configuration_md,
  'references/do-storage/gotchas.md': ref_references_do_storage_gotchas_md,
  'references/do-storage/patterns.md': ref_references_do_storage_patterns_md,
  'references/do-storage/README.md': ref_references_do_storage_README_md,
  'references/do-storage/testing.md': ref_references_do_storage_testing_md,
  'references/durable-objects/api.md': ref_references_durable_objects_api_md,
  'references/durable-objects/configuration.md': ref_references_durable_objects_configuration_md,
  'references/durable-objects/gotchas.md': ref_references_durable_objects_gotchas_md,
  'references/durable-objects/patterns.md': ref_references_durable_objects_patterns_md,
  'references/durable-objects/README.md': ref_references_durable_objects_README_md,
  'references/email-routing/api.md': ref_references_email_routing_api_md,
  'references/email-routing/configuration.md': ref_references_email_routing_configuration_md,
  'references/email-routing/gotchas.md': ref_references_email_routing_gotchas_md,
  'references/email-routing/patterns.md': ref_references_email_routing_patterns_md,
  'references/email-routing/README.md': ref_references_email_routing_README_md,
  'references/email-workers/api.md': ref_references_email_workers_api_md,
  'references/email-workers/configuration.md': ref_references_email_workers_configuration_md,
  'references/email-workers/gotchas.md': ref_references_email_workers_gotchas_md,
  'references/email-workers/patterns.md': ref_references_email_workers_patterns_md,
  'references/email-workers/README.md': ref_references_email_workers_README_md,
  'references/hyperdrive/api.md': ref_references_hyperdrive_api_md,
  'references/hyperdrive/configuration.md': ref_references_hyperdrive_configuration_md,
  'references/hyperdrive/gotchas.md': ref_references_hyperdrive_gotchas_md,
  'references/hyperdrive/patterns.md': ref_references_hyperdrive_patterns_md,
  'references/hyperdrive/README.md': ref_references_hyperdrive_README_md,
  'references/images/api.md': ref_references_images_api_md,
  'references/images/configuration.md': ref_references_images_configuration_md,
  'references/images/gotchas.md': ref_references_images_gotchas_md,
  'references/images/patterns.md': ref_references_images_patterns_md,
  'references/images/README.md': ref_references_images_README_md,
  'references/kv/api.md': ref_references_kv_api_md,
  'references/kv/configuration.md': ref_references_kv_configuration_md,
  'references/kv/gotchas.md': ref_references_kv_gotchas_md,
  'references/kv/patterns.md': ref_references_kv_patterns_md,
  'references/kv/README.md': ref_references_kv_README_md,
  'references/miniflare/api.md': ref_references_miniflare_api_md,
  'references/miniflare/configuration.md': ref_references_miniflare_configuration_md,
  'references/miniflare/gotchas.md': ref_references_miniflare_gotchas_md,
  'references/miniflare/patterns.md': ref_references_miniflare_patterns_md,
  'references/miniflare/README.md': ref_references_miniflare_README_md,
  'references/network-interconnect/api.md': ref_references_network_interconnect_api_md,
  'references/network-interconnect/configuration.md': ref_references_network_interconnect_configuration_md,
  'references/network-interconnect/gotchas.md': ref_references_network_interconnect_gotchas_md,
  'references/network-interconnect/patterns.md': ref_references_network_interconnect_patterns_md,
  'references/network-interconnect/README.md': ref_references_network_interconnect_README_md,
  'references/observability/api.md': ref_references_observability_api_md,
  'references/observability/configuration.md': ref_references_observability_configuration_md,
  'references/observability/gotchas.md': ref_references_observability_gotchas_md,
  'references/observability/patterns.md': ref_references_observability_patterns_md,
  'references/observability/README.md': ref_references_observability_README_md,
  'references/pages/api.md': ref_references_pages_api_md,
  'references/pages/configuration.md': ref_references_pages_configuration_md,
  'references/pages/gotchas.md': ref_references_pages_gotchas_md,
  'references/pages/patterns.md': ref_references_pages_patterns_md,
  'references/pages/README.md': ref_references_pages_README_md,
  'references/pages-functions/api.md': ref_references_pages_functions_api_md,
  'references/pages-functions/configuration.md': ref_references_pages_functions_configuration_md,
  'references/pages-functions/gotchas.md': ref_references_pages_functions_gotchas_md,
  'references/pages-functions/patterns.md': ref_references_pages_functions_patterns_md,
  'references/pages-functions/README.md': ref_references_pages_functions_README_md,
  'references/pipelines/api.md': ref_references_pipelines_api_md,
  'references/pipelines/configuration.md': ref_references_pipelines_configuration_md,
  'references/pipelines/gotchas.md': ref_references_pipelines_gotchas_md,
  'references/pipelines/patterns.md': ref_references_pipelines_patterns_md,
  'references/pipelines/README.md': ref_references_pipelines_README_md,
  'references/pulumi/api.md': ref_references_pulumi_api_md,
  'references/pulumi/configuration.md': ref_references_pulumi_configuration_md,
  'references/pulumi/gotchas.md': ref_references_pulumi_gotchas_md,
  'references/pulumi/patterns.md': ref_references_pulumi_patterns_md,
  'references/pulumi/README.md': ref_references_pulumi_README_md,
  'references/queues/api.md': ref_references_queues_api_md,
  'references/queues/configuration.md': ref_references_queues_configuration_md,
  'references/queues/gotchas.md': ref_references_queues_gotchas_md,
  'references/queues/patterns.md': ref_references_queues_patterns_md,
  'references/queues/README.md': ref_references_queues_README_md,
  'references/r2/api.md': ref_references_r2_api_md,
  'references/r2/configuration.md': ref_references_r2_configuration_md,
  'references/r2/gotchas.md': ref_references_r2_gotchas_md,
  'references/r2/patterns.md': ref_references_r2_patterns_md,
  'references/r2/README.md': ref_references_r2_README_md,
  'references/r2-data-catalog/api.md': ref_references_r2_data_catalog_api_md,
  'references/r2-data-catalog/configuration.md': ref_references_r2_data_catalog_configuration_md,
  'references/r2-data-catalog/gotchas.md': ref_references_r2_data_catalog_gotchas_md,
  'references/r2-data-catalog/patterns.md': ref_references_r2_data_catalog_patterns_md,
  'references/r2-data-catalog/README.md': ref_references_r2_data_catalog_README_md,
  'references/r2-sql/api.md': ref_references_r2_sql_api_md,
  'references/r2-sql/configuration.md': ref_references_r2_sql_configuration_md,
  'references/r2-sql/gotchas.md': ref_references_r2_sql_gotchas_md,
  'references/r2-sql/patterns.md': ref_references_r2_sql_patterns_md,
  'references/r2-sql/README.md': ref_references_r2_sql_README_md,
  'references/realtimekit/api.md': ref_references_realtimekit_api_md,
  'references/realtimekit/configuration.md': ref_references_realtimekit_configuration_md,
  'references/realtimekit/gotchas.md': ref_references_realtimekit_gotchas_md,
  'references/realtimekit/patterns.md': ref_references_realtimekit_patterns_md,
  'references/realtimekit/README.md': ref_references_realtimekit_README_md,
  'references/realtime-sfu/api.md': ref_references_realtime_sfu_api_md,
  'references/realtime-sfu/configuration.md': ref_references_realtime_sfu_configuration_md,
  'references/realtime-sfu/gotchas.md': ref_references_realtime_sfu_gotchas_md,
  'references/realtime-sfu/patterns.md': ref_references_realtime_sfu_patterns_md,
  'references/realtime-sfu/README.md': ref_references_realtime_sfu_README_md,
  'references/sandbox/api.md': ref_references_sandbox_api_md,
  'references/sandbox/configuration.md': ref_references_sandbox_configuration_md,
  'references/sandbox/gotchas.md': ref_references_sandbox_gotchas_md,
  'references/sandbox/patterns.md': ref_references_sandbox_patterns_md,
  'references/sandbox/README.md': ref_references_sandbox_README_md,
  'references/secrets-store/api.md': ref_references_secrets_store_api_md,
  'references/secrets-store/configuration.md': ref_references_secrets_store_configuration_md,
  'references/secrets-store/gotchas.md': ref_references_secrets_store_gotchas_md,
  'references/secrets-store/patterns.md': ref_references_secrets_store_patterns_md,
  'references/secrets-store/README.md': ref_references_secrets_store_README_md,
  'references/smart-placement/api.md': ref_references_smart_placement_api_md,
  'references/smart-placement/configuration.md': ref_references_smart_placement_configuration_md,
  'references/smart-placement/gotchas.md': ref_references_smart_placement_gotchas_md,
  'references/smart-placement/patterns.md': ref_references_smart_placement_patterns_md,
  'references/smart-placement/README.md': ref_references_smart_placement_README_md,
  'references/snippets/api.md': ref_references_snippets_api_md,
  'references/snippets/configuration.md': ref_references_snippets_configuration_md,
  'references/snippets/gotchas.md': ref_references_snippets_gotchas_md,
  'references/snippets/patterns.md': ref_references_snippets_patterns_md,
  'references/snippets/README.md': ref_references_snippets_README_md,
  'references/spectrum/api.md': ref_references_spectrum_api_md,
  'references/spectrum/configuration.md': ref_references_spectrum_configuration_md,
  'references/spectrum/gotchas.md': ref_references_spectrum_gotchas_md,
  'references/spectrum/patterns.md': ref_references_spectrum_patterns_md,
  'references/spectrum/README.md': ref_references_spectrum_README_md,
  'references/static-assets/api.md': ref_references_static_assets_api_md,
  'references/static-assets/configuration.md': ref_references_static_assets_configuration_md,
  'references/static-assets/gotchas.md': ref_references_static_assets_gotchas_md,
  'references/static-assets/patterns.md': ref_references_static_assets_patterns_md,
  'references/static-assets/README.md': ref_references_static_assets_README_md,
  'references/stream/api.md': ref_references_stream_api_md,
  'references/stream/api-live.md': ref_references_stream_api_live_md,
  'references/stream/configuration.md': ref_references_stream_configuration_md,
  'references/stream/gotchas.md': ref_references_stream_gotchas_md,
  'references/stream/patterns.md': ref_references_stream_patterns_md,
  'references/stream/README.md': ref_references_stream_README_md,
  'references/tail-workers/api.md': ref_references_tail_workers_api_md,
  'references/tail-workers/configuration.md': ref_references_tail_workers_configuration_md,
  'references/tail-workers/gotchas.md': ref_references_tail_workers_gotchas_md,
  'references/tail-workers/patterns.md': ref_references_tail_workers_patterns_md,
  'references/tail-workers/README.md': ref_references_tail_workers_README_md,
  'references/terraform/api.md': ref_references_terraform_api_md,
  'references/terraform/configuration.md': ref_references_terraform_configuration_md,
  'references/terraform/gotchas.md': ref_references_terraform_gotchas_md,
  'references/terraform/patterns.md': ref_references_terraform_patterns_md,
  'references/terraform/README.md': ref_references_terraform_README_md,
  'references/tunnel/api.md': ref_references_tunnel_api_md,
  'references/tunnel/configuration.md': ref_references_tunnel_configuration_md,
  'references/tunnel/gotchas.md': ref_references_tunnel_gotchas_md,
  'references/tunnel/networking.md': ref_references_tunnel_networking_md,
  'references/tunnel/patterns.md': ref_references_tunnel_patterns_md,
  'references/tunnel/README.md': ref_references_tunnel_README_md,
  'references/turn/api.md': ref_references_turn_api_md,
  'references/turn/configuration.md': ref_references_turn_configuration_md,
  'references/turn/gotchas.md': ref_references_turn_gotchas_md,
  'references/turn/patterns.md': ref_references_turn_patterns_md,
  'references/turn/README.md': ref_references_turn_README_md,
  'references/turnstile/api.md': ref_references_turnstile_api_md,
  'references/turnstile/configuration.md': ref_references_turnstile_configuration_md,
  'references/turnstile/gotchas.md': ref_references_turnstile_gotchas_md,
  'references/turnstile/patterns.md': ref_references_turnstile_patterns_md,
  'references/turnstile/README.md': ref_references_turnstile_README_md,
  'references/vectorize/api.md': ref_references_vectorize_api_md,
  'references/vectorize/configuration.md': ref_references_vectorize_configuration_md,
  'references/vectorize/gotchas.md': ref_references_vectorize_gotchas_md,
  'references/vectorize/patterns.md': ref_references_vectorize_patterns_md,
  'references/vectorize/README.md': ref_references_vectorize_README_md,
  'references/waf/api.md': ref_references_waf_api_md,
  'references/waf/configuration.md': ref_references_waf_configuration_md,
  'references/waf/gotchas.md': ref_references_waf_gotchas_md,
  'references/waf/patterns.md': ref_references_waf_patterns_md,
  'references/waf/README.md': ref_references_waf_README_md,
  'references/web-analytics/configuration.md': ref_references_web_analytics_configuration_md,
  'references/web-analytics/gotchas.md': ref_references_web_analytics_gotchas_md,
  'references/web-analytics/integration.md': ref_references_web_analytics_integration_md,
  'references/web-analytics/patterns.md': ref_references_web_analytics_patterns_md,
  'references/web-analytics/README.md': ref_references_web_analytics_README_md,
  'references/workerd/api.md': ref_references_workerd_api_md,
  'references/workerd/configuration.md': ref_references_workerd_configuration_md,
  'references/workerd/gotchas.md': ref_references_workerd_gotchas_md,
  'references/workerd/patterns.md': ref_references_workerd_patterns_md,
  'references/workerd/README.md': ref_references_workerd_README_md,
  'references/workers/api.md': ref_references_workers_api_md,
  'references/workers/configuration.md': ref_references_workers_configuration_md,
  'references/workers/frameworks.md': ref_references_workers_frameworks_md,
  'references/workers/gotchas.md': ref_references_workers_gotchas_md,
  'references/workers/patterns.md': ref_references_workers_patterns_md,
  'references/workers/README.md': ref_references_workers_README_md,
  'references/workers-ai/api.md': ref_references_workers_ai_api_md,
  'references/workers-ai/configuration.md': ref_references_workers_ai_configuration_md,
  'references/workers-ai/gotchas.md': ref_references_workers_ai_gotchas_md,
  'references/workers-ai/patterns.md': ref_references_workers_ai_patterns_md,
  'references/workers-ai/README.md': ref_references_workers_ai_README_md,
  'references/workers-for-platforms/api.md': ref_references_workers_for_platforms_api_md,
  'references/workers-for-platforms/configuration.md': ref_references_workers_for_platforms_configuration_md,
  'references/workers-for-platforms/gotchas.md': ref_references_workers_for_platforms_gotchas_md,
  'references/workers-for-platforms/patterns.md': ref_references_workers_for_platforms_patterns_md,
  'references/workers-for-platforms/README.md': ref_references_workers_for_platforms_README_md,
  'references/workers-playground/api.md': ref_references_workers_playground_api_md,
  'references/workers-playground/configuration.md': ref_references_workers_playground_configuration_md,
  'references/workers-playground/gotchas.md': ref_references_workers_playground_gotchas_md,
  'references/workers-playground/patterns.md': ref_references_workers_playground_patterns_md,
  'references/workers-playground/README.md': ref_references_workers_playground_README_md,
  'references/workers-vpc/api.md': ref_references_workers_vpc_api_md,
  'references/workers-vpc/configuration.md': ref_references_workers_vpc_configuration_md,
  'references/workers-vpc/gotchas.md': ref_references_workers_vpc_gotchas_md,
  'references/workers-vpc/patterns.md': ref_references_workers_vpc_patterns_md,
  'references/workers-vpc/README.md': ref_references_workers_vpc_README_md,
  'references/workflows/api.md': ref_references_workflows_api_md,
  'references/workflows/configuration.md': ref_references_workflows_configuration_md,
  'references/workflows/gotchas.md': ref_references_workflows_gotchas_md,
  'references/workflows/patterns.md': ref_references_workflows_patterns_md,
  'references/workflows/README.md': ref_references_workflows_README_md,
  'references/wrangler/api.md': ref_references_wrangler_api_md,
  'references/wrangler/auth.md': ref_references_wrangler_auth_md,
  'references/wrangler/configuration.md': ref_references_wrangler_configuration_md,
  'references/wrangler/gotchas.md': ref_references_wrangler_gotchas_md,
  'references/wrangler/patterns.md': ref_references_wrangler_patterns_md,
  'references/wrangler/README.md': ref_references_wrangler_README_md,
  'references/zaraz/api.md': ref_references_zaraz_api_md,
  'references/zaraz/configuration.md': ref_references_zaraz_configuration_md,
  'references/zaraz/gotchas.md': ref_references_zaraz_gotchas_md,
  'references/zaraz/IMPLEMENTATION_SUMMARY.md': ref_references_zaraz_IMPLEMENTATION_SUMMARY_md,
  'references/zaraz/patterns.md': ref_references_zaraz_patterns_md,
  'references/zaraz/README.md': ref_references_zaraz_README_md,
}
