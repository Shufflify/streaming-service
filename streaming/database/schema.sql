DROP DATABASE IF EXISTS shufflify;
--
CREATE DATABASE shufflify;
--
USE shufflify;
-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'songs'
--
-- ---

DROP TABLE IF EXISTS `songs`;

CREATE TABLE `songs` (
  `id` INTEGER AUTO_INCREMENT,
  `filepath` VARCHAR(50) NOT NULL,
  `duration` INTEGER NOT NULL,
  `filesize` INTEGER NOT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Foreign Keys
-- ---


-- ---
-- Table Properties
-- ---

-- ALTER TABLE `songs` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

-- INSERT INTO `songs` (`id`,`filepath`,`duration`,`filesize`) VALUES
-- ('','','','');
