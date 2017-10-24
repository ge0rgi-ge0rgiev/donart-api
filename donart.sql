-- MySQL dump 10.13  Distrib 5.7.19, for Linux (x86_64)
--
-- Host: localhost    Database: donart
-- ------------------------------------------------------
-- Server version	5.7.19-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `client_addresses`
--

DROP TABLE IF EXISTS `client_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client_addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `address` varchar(100) NOT NULL,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_addresses_clients_FK` (`client_id`),
  CONSTRAINT `user_addresses_clients_FK` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_addresses`
--

LOCK TABLES `client_addresses` WRITE;
/*!40000 ALTER TABLE `client_addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `client_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `phone2` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `discount` double DEFAULT NULL,
  `receive_sms` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clients_phone_UN` (`phone`),
  UNIQUE KEY `clients_phone2_UN` (`phone2`),
  KEY `clients_users_FK` (`user_id`),
  CONSTRAINT `clients_users_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,1,'Georgi','Georgiev','0878878096',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nfc_tags`
--

DROP TABLE IF EXISTS `nfc_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nfc_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_id` varchar(100) NOT NULL,
  `status` enum('attached','preparing','ready') NOT NULL DEFAULT 'attached',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nfc_tags`
--

LOCK TABLES `nfc_tags` WRITE;
/*!40000 ALTER TABLE `nfc_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `nfc_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_products`
--

DROP TABLE IF EXISTS `order_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `nfc_tag_id` int(11) NOT NULL,
  `count` int(11) NOT NULL,
  `discount` double DEFAULT NULL COMMENT 'The discounted amount',
  `total_amount` double NOT NULL COMMENT 'Total product amount',
  PRIMARY KEY (`id`),
  KEY `order_products_orders_FK` (`order_id`),
  KEY `order_products_services_FK` (`service_id`),
  CONSTRAINT `order_products_orders_FK` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_products_services_FK` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_products`
--

LOCK TABLES `order_products` WRITE;
/*!40000 ALTER TABLE `order_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `order_status` enum('pending','canceled','in_progress','ready','finished') NOT NULL DEFAULT 'pending',
  `payment_status` enum('unpaid','partlyPaid','paid') NOT NULL,
  `payment_method` enum('cash','card','unknown') DEFAULT 'unknown',
  `note` varchar(100) DEFAULT NULL,
  `delivery_address` varchar(100) DEFAULT NULL,
  `delivery_long` double DEFAULT NULL,
  `delivery_lat` double DEFAULT NULL,
  `due_date` bigint(20) DEFAULT NULL,
  `created_at` bigint(20) DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `paid_amount` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_users_FK` (`user_id`),
  KEY `orders_clients_FK` (`client_id`),
  CONSTRAINT `orders_clients_FK` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `orders_users_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_categories`
--

DROP TABLE IF EXISTS `service_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) DEFAULT NULL,
  `label` varchar(100) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_categories_UN` (`label`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_categories`
--

LOCK TABLES `service_categories` WRITE;
/*!40000 ALTER TABLE `service_categories` DISABLE KEYS */;
INSERT INTO `service_categories` VALUES (1,NULL,'Химическо чистене',1),(14,NULL,'Боядисване',1),(15,1,'Химическо - Костюми',1),(16,1,'Химическо - Якета',1),(17,14,'Боядисване - Обувки',1);
/*!40000 ALTER TABLE `service_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_category_id` int(11) NOT NULL,
  `label` varchar(100) NOT NULL,
  `info` text,
  `price` double NOT NULL,
  `discountable` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `services_service_categories_FK` (`service_category_id`),
  CONSTRAINT `services_service_categories_FK` FOREIGN KEY (`service_category_id`) REFERENCES `service_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,1,'Панталон',NULL,20,0,1),(2,15,'Смокинг',NULL,20,0,1),(3,17,'Ботуши Мотуши',NULL,15,1,1);
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `auth_token` varchar(50) NOT NULL,
  `refresh_token` varchar(50) NOT NULL,
  `expiration` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_users_FK` (`user_id`),
  CONSTRAINT `session_users_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
INSERT INTO `session` VALUES (3,2,'asdadadadada','asddgff','2017-10-13 16:36:18'),(4,2,'tokeen','dsada','2017-10-14 22:42:16'),(11,1,'3CN79ARTWD9N3ZDSW0STYR5L9FDU77AOIDV97MWWCG10H2CDGB','2HIOZS84GLDBY2456IJIGDYZYA8GLE4M84KJOZ57LNGZS14AJA','2017-10-24 22:55:03');
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms`
--

DROP TABLE IF EXISTS `sms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sms_template_id` int(11) NOT NULL,
  `object_id` int(11) DEFAULT NULL COMMENT 'For relation with corresponding table field in sms_types table',
  `phone` varchar(100) NOT NULL,
  `message` varchar(255) NOT NULL,
  `status` enum('notSent','failed','reSending','sent') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sms_sms_templates_FK` (`sms_template_id`),
  CONSTRAINT `sms_sms_templates_FK` FOREIGN KEY (`sms_template_id`) REFERENCES `sms_templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms`
--

LOCK TABLES `sms` WRITE;
/*!40000 ALTER TABLE `sms` DISABLE KEYS */;
/*!40000 ALTER TABLE `sms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_templates`
--

DROP TABLE IF EXISTS `sms_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sms_type_id` int(11) NOT NULL,
  `content` varchar(255) NOT NULL,
  `language` varchar(100) DEFAULT NULL COMMENT 'Two iso code',
  PRIMARY KEY (`id`),
  KEY `sms_templates_sms_types_FK` (`sms_type_id`),
  CONSTRAINT `sms_templates_sms_types_FK` FOREIGN KEY (`sms_type_id`) REFERENCES `sms_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_templates`
--

LOCK TABLES `sms_templates` WRITE;
/*!40000 ALTER TABLE `sms_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `sms_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_types`
--

DROP TABLE IF EXISTS `sms_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL,
  `label` varchar(100) NOT NULL,
  `table` varchar(100) DEFAULT NULL COMMENT 'Corresponding table',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_types`
--

LOCK TABLES `sms_types` WRITE;
/*!40000 ALTER TABLE `sms_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `sms_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `password` varchar(60) NOT NULL,
  `is_admin` tinyint(4) NOT NULL DEFAULT '0',
  `active` tinyint(4) NOT NULL DEFAULT '1',
  `avatar` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Pafkata','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',1,1,'http://localhost:3000/avatar/user_1.png'),(2,'georgi','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',1,0,NULL),(3,'Genko','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',0,1,NULL),(4,'Genko','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',0,1,NULL),(5,'Genko','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',0,1,NULL),(6,'Genko','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',0,1,NULL),(7,'Genko','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',0,1,NULL),(8,'Genko','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',0,1,NULL),(9,'Genko','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',0,1,NULL),(10,'Genko','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',0,1,NULL),(11,'Genko','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',0,1,NULL),(12,'Stefko','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',0,1,NULL),(13,'Petkan','$2a$10$ZzU7rZOTPSagDgR9ltdeHO7sC7sJSRa2D.j1IRqG8w99Pm9HrVVz2',0,0,'http://localhost:3000/avatar/user_13.png'),(14,'Pafkata','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',1,1,NULL),(15,'Pafkata','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',1,1,NULL),(16,'Pafkata','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',0,1,NULL),(17,'Pafkata','$2a$10$ZzU7rZOTPSagDgR9ltdeHOt4lB/TEoNaUdxzwMYKwQupOMlNjVmPm',0,1,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-10-24 22:41:33
