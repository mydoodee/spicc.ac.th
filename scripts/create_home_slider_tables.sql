CREATE TABLE IF NOT EXISTS `cms_home_slider` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `is_enabled` tinyint(1) DEFAULT 1,
  `transition_style` varchar(50) DEFAULT 'carousel',
  `autoplay_speed` int(11) DEFAULT 5000,
  `show_arrows` tinyint(1) DEFAULT 1,
  `show_pagination` tinyint(1) DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `cms_home_slider_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `link_target` varchar(20) DEFAULT '_self',
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default settings
INSERT INTO `cms_home_slider` (`is_enabled`, `transition_style`) VALUES (1, 'carousel') ON DUPLICATE KEY UPDATE id=id;
