<?php

return array(
  'feature_map' => array(
    'action_logs' => 'security',
    'attribution' => 'tracking',
    'basic_analytics' => 'tracking',
    'basic_auth' => 'security',
    'compliance_reporting' => 'security',
    'consent_mode_v2' => 'tracking',
    'cross_channel_attribution' => 'tracking',
    'custom_destinations' => 'tracking',
    'destinations' => 'tracking',
    'enhanced_conversions' => 'tracking',
    'event_tracking' => 'tracking',
    'full_audit_trail' => 'security',
    'ip_whitelisting' => 'security',
    'measurement_protocol' => 'tracking',
    'server_containers' => 'tracking',
    'sgtm_proxy' => 'tracking',
    'sso_integration' => 'security',
    'tag_management' => 'tracking',
    'two_factor_auth' => 'security',
  ),
  'tiers' => array(
    'security' => 
    array(
      'starter' => 
      array(
        0 => 'action_logs',
        1 => 'basic_auth',
        2 => 'full_audit_trail',
        3 => 'ip_whitelisting',
        4 => 'two_factor_auth',
      ),
      'growth' => 
      array(
        0 => 'action_logs',
        1 => 'basic_auth',
        2 => 'full_audit_trail',
        3 => 'ip_whitelisting',
        4 => 'two_factor_auth',
      ),
      'pro' => 
      array(
        0 => 'action_logs',
        1 => 'basic_auth',
        2 => 'full_audit_trail',
        3 => 'ip_whitelisting',
        4 => 'two_factor_auth',
        5 => 'compliance_reporting',
        6 => 'sso_integration',
      ),
    ),
    'tracking' => 
    array(
      'starter' => 
      array(
        0 => 'attribution',
        1 => 'basic_analytics',
        2 => 'consent_mode_v2',
        3 => 'cross_channel_attribution',
        4 => 'destinations',
        5 => 'enhanced_conversions',
        6 => 'measurement_protocol',
        7 => 'server_containers',
        8 => 'sgtm_proxy',
      ),
      'growth' => 
      array(
        0 => 'attribution',
        1 => 'basic_analytics',
        2 => 'consent_mode_v2',
        3 => 'cross_channel_attribution',
        4 => 'destinations',
        5 => 'enhanced_conversions',
        6 => 'measurement_protocol',
        7 => 'server_containers',
        8 => 'sgtm_proxy',
        9 => 'event_tracking',
        10 => 'tag_management',
      ),
      'pro' => 
      array(
        0 => 'attribution',
        1 => 'basic_analytics',
        2 => 'consent_mode_v2',
        3 => 'cross_channel_attribution',
        4 => 'destinations',
        5 => 'enhanced_conversions',
        6 => 'measurement_protocol',
        7 => 'server_containers',
        8 => 'sgtm_proxy',
        9 => 'event_tracking',
        10 => 'tag_management',
        11 => 'custom_destinations',
      ),
    ),
  ),
);
