CREATE DATABASE  IF NOT EXISTS `security_system_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `security_system_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: security_system_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '3bd31b54-ffea-11f0-82d0-74d4dd636397:1-2621';

--
-- Table structure for table `alert_receipts`
--

DROP TABLE IF EXISTS `alert_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alert_receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alert_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `alert_id` (`alert_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `alert_receipts_ibfk_1` FOREIGN KEY (`alert_id`) REFERENCES `emergency_alerts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alert_receipts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alert_receipts`
--

LOCK TABLES `alert_receipts` WRITE;
/*!40000 ALTER TABLE `alert_receipts` DISABLE KEYS */;
INSERT INTO `alert_receipts` VALUES (1,3,6,'2026-05-13 14:47:04'),(2,4,6,'2026-05-15 03:46:09'),(3,5,6,'2026-05-19 02:53:58'),(4,5,9,NULL),(5,5,15,NULL),(6,5,17,NULL),(7,6,6,'2026-05-19 02:53:58'),(8,7,6,'2026-05-19 02:53:57');
/*!40000 ALTER TABLE `alert_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment_visitors`
--

DROP TABLE IF EXISTS `appointment_visitors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_visitors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `visitor_name` varchar(100) NOT NULL,
  `ble_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appointment_id` (`appointment_id`),
  CONSTRAINT `appointment_visitors_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `visitor_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_visitors`
--

LOCK TABLES `appointment_visitors` WRITE;
/*!40000 ALTER TABLE `appointment_visitors` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointment_visitors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `status` enum('present','late','absent','on leave') DEFAULT NULL,
  `location` varchar(500) DEFAULT NULL,
  `total_hours` decimal(5,2) DEFAULT '0.00',
  `clock_in_selfie` varchar(500) DEFAULT NULL,
  `clock_out_selfie` varchar(500) DEFAULT NULL,
  `clock_in_biometric_verified` tinyint(1) DEFAULT '0',
  `clock_out_biometric_verified` tinyint(1) DEFAULT '0',
  `clock_in_latitude` decimal(10,8) DEFAULT NULL,
  `clock_in_longitude` decimal(11,8) DEFAULT NULL,
  `clock_out_latitude` decimal(10,8) DEFAULT NULL,
  `clock_out_longitude` decimal(11,8) DEFAULT NULL,
  `correction_requested` tinyint(1) DEFAULT '0',
  `correction_status` enum('pending','approved','rejected') DEFAULT NULL,
  `correction_reason` text,
  `schedule_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_attendance_schedule` (`schedule_id`),
  CONSTRAINT `fk_attendance_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (1,'E002','2026-04-07','19:16:24','20:00:41','present','G2Q2+388, Pasay City',0.00,NULL,NULL,0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,2),(2,'E002','2026-04-14',NULL,NULL,'on leave','Remote/Leave',0.00,NULL,NULL,0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL),(3,'E002','2026-04-17',NULL,NULL,'on leave','Remote/Leave',0.00,NULL,NULL,0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL),(4,'E002','2026-05-05',NULL,NULL,'on leave','Remote/Leave',0.00,NULL,NULL,0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL),(5,'E002','2026-05-01','15:00:00','17:00:00','present','Appeal Approved',2.00,NULL,NULL,0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,5),(9,'E002','2026-05-02','20:33:25','22:22:09','late','Pearl Drive, Pasay City',0.00,NULL,NULL,0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,11),(10,'E007','2026-05-02','22:33:41','22:41:21','late','España Boulevard, Quezon City',0.00,NULL,NULL,0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,13),(11,'E002','2026-05-06',NULL,'10:15:21','on leave','Tower 3, S Residences, Lot 2, Barangay 76, Zone 10, Central Business Park 1-A, 1300, Pasay City',0.00,NULL,NULL,0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,18),(12,'E009','2026-05-06','03:34:06','10:15:08','late','Tower 3, S Residences, Lot 2, Barangay 76, Zone 10, Central Business Park 1-A, 1300, Pasay City',0.00,NULL,NULL,0,0,NULL,NULL,NULL,NULL,0,NULL,NULL,19),(19,'E006','2026-05-21','03:28:27','06:41:12','present','S Residence Tower 3 (14.532808, 120.988625)',3.21,NULL,'/uploads/selfies/1779316872267-55061367.jpg',0,0,14.53280800,120.98862450,14.53290850,120.98822980,0,NULL,NULL,37),(21,'E006','2026-05-21','10:51:13','16:46:09','late','S Residence Tower 3',0.00,'/uploads/selfies/1779331872860-896301443.jpg','/uploads/selfies/1779353062996-671930565.jpg',0,0,14.53295340,120.98822400,14.53312340,120.98787920,0,NULL,NULL,38);
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_appeals`
--

DROP TABLE IF EXISTS `attendance_appeals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_appeals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `reason` text NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_remarks` text,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `attendance_appeals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_appeals`
--

LOCK TABLES `attendance_appeals` WRITE;
/*!40000 ALTER TABLE `attendance_appeals` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance_appeals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_corrections`
--

DROP TABLE IF EXISTS `attendance_corrections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_corrections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `attendance_date` date NOT NULL,
  `requested_clock_in` time DEFAULT NULL,
  `requested_clock_out` time DEFAULT NULL,
  `reason` text NOT NULL,
  `selfie_url` varchar(500) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `reviewed_by` (`reviewed_by`),
  CONSTRAINT `attendance_corrections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `attendance_corrections_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_corrections`
--

LOCK TABLES `attendance_corrections` WRITE;
/*!40000 ALTER TABLE `attendance_corrections` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance_corrections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` varchar(50) DEFAULT NULL,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_action` (`user_id`,`action`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,9,'LOGIN','user','9',NULL,NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-25 08:46:19'),(2,9,'REJECT_LEAVE','leave_request','16',NULL,NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-25 08:53:14'),(3,15,'LOGIN','user','15',NULL,NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-25 08:55:18'),(4,15,'LOGIN','user','15',NULL,NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-25 09:07:30'),(5,17,'LOGIN','user','17',NULL,NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-25 09:13:21');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ble_tags`
--

DROP TABLE IF EXISTS `ble_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ble_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ble_id` varchar(50) NOT NULL,
  `label` varchar(100) DEFAULT NULL,
  `mac_address` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ble_id` (`ble_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ble_tags`
--

LOCK TABLES `ble_tags` WRITE;
/*!40000 ALTER TABLE `ble_tags` DISABLE KEYS */;
INSERT INTO `ble_tags` VALUES (7,'ESP 32-Badge2','Beacon 2','30:76:f5:e8:da:02'),(8,'ESP32-Badge1','Beacon 1','b0:cb:d8:e9:80:62');
/*!40000 ALTER TABLE `ble_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `user_id` int NOT NULL,
  `message` text NOT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`),
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (2,7,9,'hi','2026-05-10 13:27:05'),(3,7,15,'hello','2026-05-10 13:32:39'),(5,7,9,'hello','2026-05-10 13:59:40'),(6,7,15,'hi','2026-05-10 14:06:08'),(7,7,9,'hello','2026-05-10 14:11:45'),(8,7,9,'hi','2026-05-10 14:17:37'),(9,9,15,'hi','2026-05-10 15:11:43');
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_room_members`
--

DROP TABLE IF EXISTS `chat_room_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_room_members` (
  `room_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`room_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `chat_room_members_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_room_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_room_members`
--

LOCK TABLES `chat_room_members` WRITE;
/*!40000 ALTER TABLE `chat_room_members` DISABLE KEYS */;
INSERT INTO `chat_room_members` VALUES (9,1,'2026-05-10 15:11:40'),(9,6,'2026-05-10 15:11:40'),(9,9,'2026-05-10 15:11:40'),(9,15,'2026-05-10 15:11:40'),(9,17,'2026-05-10 15:11:40');
/*!40000 ALTER TABLE `chat_room_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_rooms`
--

DROP TABLE IF EXISTS `chat_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('group','direct') DEFAULT 'group',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_rooms`
--

LOCK TABLES `chat_rooms` WRITE;
/*!40000 ALTER TABLE `chat_rooms` DISABLE KEYS */;
INSERT INTO `chat_rooms` VALUES (1,'General','group','2026-05-08 05:04:08'),(2,'Security','group','2026-05-08 05:04:08'),(3,'HR','group','2026-05-08 05:04:08'),(4,'Academics','group','2026-05-08 05:04:08'),(7,'dm_9_15','direct','2026-05-10 13:27:03'),(9,'TEAM X0','group','2026-05-10 15:11:40');
/*!40000 ALTER TABLE `chat_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (3,'Allied Health 2'),(1,'Healthcare101');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emergency_alerts`
--

DROP TABLE IF EXISTS `emergency_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emergency_alerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `severity` enum('info','warning','critical') DEFAULT 'info',
  `target_roles` json DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emergency_alerts`
--

LOCK TABLES `emergency_alerts` WRITE;
/*!40000 ALTER TABLE `emergency_alerts` DISABLE KEYS */;
INSERT INTO `emergency_alerts` VALUES (1,'Typhoon','No work','warning','[\"instructor\"]','2026-05-13 14:24:10',NULL,1),(2,'fgjf','jhkururu','info','[\"instructor\"]','2026-05-13 14:24:39',NULL,1),(3,'zsgfgfd','fvszsf','info','[\"instructor\"]','2026-05-13 14:35:40',NULL,1),(4,'dghghs','bvsdfddbgbs','warning','[\"instructor\"]','2026-05-13 14:56:27',NULL,1),(5,'sdasdasdd','DFdfAFAF','info','[\"instructor\", \"admin\", \"security\", \"hr_admin\"]','2026-05-19 02:04:12',NULL,1),(6,'sddd','cAaDASD','warning','[\"instructor\"]','2026-05-19 02:06:29',NULL,1),(7,'fAfa','FdF','info','[\"instructor\"]','2026-05-19 02:08:35',NULL,1);
/*!40000 ALTER TABLE `emergency_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_documents`
--

DROP TABLE IF EXISTS `employee_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `employee_documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_documents`
--

LOCK TABLES `employee_documents` WRITE;
/*!40000 ALTER TABLE `employee_documents` DISABLE KEYS */;
INSERT INTO `employee_documents` VALUES (1,6,'E006','Proof','/uploads/documents/leave_1778577728106-844860394.png',15,'2026-05-12 09:22:08');
/*!40000 ALTER TABLE `employee_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_leave_balances`
--

DROP TABLE IF EXISTS `employee_leave_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_leave_balances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `remaining_days` decimal(5,2) NOT NULL DEFAULT '0.00',
  `year` int NOT NULL,
  `last_updated` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_balance` (`user_id`,`leave_type_id`,`year`),
  KEY `leave_type_id` (`leave_type_id`),
  CONSTRAINT `employee_leave_balances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employee_leave_balances_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_leave_balances`
--

LOCK TABLES `employee_leave_balances` WRITE;
/*!40000 ALTER TABLE `employee_leave_balances` DISABLE KEYS */;
INSERT INTO `employee_leave_balances` VALUES (1,17,1,15.00,2026,'2026-05-13'),(2,15,1,15.00,2026,'2026-05-13'),(3,9,1,15.00,2026,'2026-05-13'),(4,6,1,15.00,2026,'2026-05-13'),(5,17,2,15.00,2026,'2026-05-13'),(6,15,2,15.00,2026,'2026-05-13'),(7,9,2,15.00,2026,'2026-05-13'),(8,6,2,15.00,2026,'2026-05-13'),(9,17,3,5.00,2026,'2026-05-13'),(10,15,3,5.00,2026,'2026-05-13'),(11,9,3,5.00,2026,'2026-05-13'),(12,6,3,5.00,2026,'2026-05-13');
/*!40000 ALTER TABLE `employee_leave_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `place` varchar(255) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `type` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (7,'MMM','2026-05-08','LLLL','10:04:00','20:04:00','Meeting',''),(8,'Nutrition month','2026-05-15','Room 101','06:51:00','00:00:00','School Event',''),(9,'RE-ORAL','2026-05-19','NU-MOA','12:00:00','00:00:00','School Event',''),(10,'sfFF','2026-05-19','CcCSC','00:00:00','00:00:00','Meeting',''),(11,'sdsd','2026-05-21','scsd','00:00:00','00:00:00','Holiday','sdsds'),(12,'zxfXcc','2026-05-19','asdsd','00:00:00','00:00:00','Holiday','sad'),(13,'zxcc','2026-05-19','xccc','00:00:00','00:00:00','School Event','acacc'),(14,'mnbmj','2026-05-19','hmn','00:00:00','00:00:00','Note/Reminder','hj'),(15,'sddss','2026-05-19','sdsd','00:00:00','00:00:00','School Event','sds');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `geofences`
--

DROP TABLE IF EXISTS `geofences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `geofences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `radius_meters` int DEFAULT '200',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `geofences`
--

LOCK TABLES `geofences` WRITE;
/*!40000 ALTER TABLE `geofences` DISABLE KEYS */;
INSERT INTO `geofences` VALUES (1,'NU MOA',14.53057000,120.98110000,200),(2,'HCT Academy Pasig',14.57478000,121.06070000,200);
/*!40000 ALTER TABLE `geofences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_policies`
--

DROP TABLE IF EXISTS `hr_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_policies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `hr_policies_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_policies`
--

LOCK TABLES `hr_policies` WRITE;
/*!40000 ALTER TABLE `hr_policies` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_location_tracking`
--

DROP TABLE IF EXISTS `instructor_location_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_location_tracking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(20) NOT NULL,
  `schedule_id` int DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `location_name` varchar(255) DEFAULT NULL,
  `is_inside_campus` tinyint(1) DEFAULT '1',
  `location_enabled` tinyint(1) DEFAULT '1',
  `alert_sent` tinyint(1) DEFAULT '0',
  `ping_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`,`ping_time`),
  KEY `idx_employee_ping` (`employee_id`,`ping_time`)
) ENGINE=InnoDB AUTO_INCREMENT=519 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_location_tracking`
--

LOCK TABLES `instructor_location_tracking` WRITE;
/*!40000 ALTER TABLE `instructor_location_tracking` DISABLE KEYS */;
INSERT INTO `instructor_location_tracking` VALUES (1,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:25:23'),(2,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:27:23'),(3,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:28:22'),(4,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:30:22'),(5,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:32:22'),(6,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:34:22'),(7,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:36:22'),(8,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:38:22'),(9,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-21 03:23:00'),(10,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:43:15'),(11,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:45:15'),(12,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:47:15'),(13,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:49:15'),(14,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:51:15'),(15,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:53:15'),(16,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:54:22'),(17,'E006',NULL,14.53280800,120.98862450,NULL,1,1,0,'2026-05-20 19:56:42'),(18,'E006',35,14.53295640,120.98822730,'S Residence Tower 3',1,1,0,'2026-05-20 22:41:07'),(19,'E006',37,14.53293800,120.98822750,'S Residence Tower 3',1,1,0,'2026-05-21 01:14:37'),(20,'E006',37,14.53295010,120.98821860,'S Residence Tower 3',1,1,0,'2026-05-21 03:52:07'),(21,'E006',37,14.53264720,120.98802970,'S Residence Tower 3',1,1,0,'2026-05-21 03:55:07'),(22,'E006',37,14.53300660,120.98834290,'S Residence Tower 3',1,1,0,'2026-05-21 04:01:24'),(23,'E006',37,14.53313910,120.98826450,'S Residence Tower 3',1,1,0,'2026-05-21 04:04:57'),(24,'E006',37,14.53313910,120.98826450,'S Residence Tower 3',1,1,0,'2026-05-21 04:05:00'),(25,'E006',37,14.53307320,120.98828270,'S Residence Tower 3',1,1,0,'2026-05-21 04:05:52'),(26,'E006',37,14.53317930,120.98821890,'S Residence Tower 3',1,1,0,'2026-05-21 04:06:24'),(27,'E006',37,14.53276790,120.98833000,'S Residence Tower 3',1,1,0,'2026-05-21 04:07:06'),(28,'E006',37,14.53295110,120.98822090,'S Residence Tower 3',1,1,0,'2026-05-21 04:07:38'),(29,'E006',37,14.53252570,120.98815700,'S Residence Tower 3',1,1,0,'2026-05-21 04:08:09'),(30,'E006',37,14.53295980,120.98822300,'S Residence Tower 3',1,1,0,'2026-05-21 04:08:41'),(31,'E006',37,14.53304250,120.98818200,'S Residence Tower 3',1,1,0,'2026-05-21 04:09:24'),(32,'E006',37,14.53295310,120.98822870,'S Residence Tower 3',1,1,0,'2026-05-21 04:10:15'),(33,'E006',37,14.53304850,120.98825020,'S Residence Tower 3',1,1,0,'2026-05-21 04:12:20'),(34,'E006',37,14.53281370,120.98811320,'S Residence Tower 3',1,1,0,'2026-05-21 04:13:20'),(35,'E006',37,14.53307900,120.98819770,'S Residence Tower 3',1,1,0,'2026-05-21 04:13:50'),(36,'E006',37,14.53295220,120.98822370,'S Residence Tower 3',1,1,0,'2026-05-21 04:14:37'),(37,'E006',37,14.53318840,120.98822650,'S Residence Tower 3',1,1,0,'2026-05-21 04:15:27'),(38,'E006',37,14.53295140,120.98822980,'S Residence Tower 3',1,1,0,'2026-05-21 04:16:12'),(39,'E006',37,14.53296550,120.98820000,'S Residence Tower 3',1,1,0,'2026-05-21 04:17:34'),(40,'E006',37,14.53296550,120.98820000,'S Residence Tower 3',1,1,0,'2026-05-21 04:17:36'),(41,'E006',37,14.53294880,120.98822230,'S Residence Tower 3',1,1,0,'2026-05-21 04:18:37'),(42,'E006',37,14.53294880,120.98822230,'S Residence Tower 3',1,1,0,'2026-05-21 04:18:39'),(43,'E006',37,14.53295990,120.98819960,'S Residence Tower 3',1,1,0,'2026-05-21 04:19:10'),(44,'E006',37,14.53293630,120.98822920,'S Residence Tower 3',1,1,0,'2026-05-21 04:19:42'),(45,'E006',37,14.53295570,120.98822560,'S Residence Tower 3',1,1,0,'2026-05-21 04:20:13'),(46,'E006',37,14.53286850,120.98816750,'S Residence Tower 3',1,1,0,'2026-05-21 04:20:50'),(47,'E006',37,14.53294680,120.98820410,'S Residence Tower 3',1,1,0,'2026-05-21 04:21:46'),(48,'E006',37,14.53294680,120.98820410,'S Residence Tower 3',1,1,0,'2026-05-21 04:21:48'),(49,'E006',37,14.53294930,120.98823300,'S Residence Tower 3',1,1,0,'2026-05-21 04:22:19'),(50,'E006',37,14.53276950,120.98820380,'S Residence Tower 3',1,1,0,'2026-05-21 04:22:48'),(51,'E006',37,14.53294170,120.98823580,'S Residence Tower 3',1,1,0,'2026-05-21 05:25:25'),(52,'E006',37,14.53276790,120.98823120,'S Residence Tower 3',1,1,0,'2026-05-21 05:55:38'),(53,'E006',37,14.53294640,120.98822160,'S Residence Tower 3',1,1,0,'2026-05-21 05:59:57'),(54,'E006',37,14.53294720,120.98821520,'S Residence Tower 3',1,1,0,'2026-05-21 06:18:04'),(55,'E006',37,14.53295490,120.98821420,'S Residence Tower 3',1,1,0,'2026-05-21 06:31:08'),(56,'E006',37,14.53293780,120.98819180,'S Residence Tower 3',1,1,0,'2026-05-21 06:37:51'),(57,'E006',37,14.53296440,120.98824070,'S Residence Tower 3',1,1,0,'2026-05-21 06:52:22'),(58,'E006',37,14.53293780,120.98821380,'S Residence Tower 3',1,1,0,'2026-05-21 07:02:09'),(59,'E006',37,14.53294120,120.98822290,'S Residence Tower 3',1,1,0,'2026-05-21 07:08:33'),(60,'E006',37,14.53294120,120.98822290,'S Residence Tower 3',1,1,0,'2026-05-21 07:08:33'),(61,'E006',37,14.53273770,120.98830670,'S Residence Tower 3',1,1,0,'2026-05-21 07:21:46'),(62,'E006',37,14.53282780,120.98821400,'S Residence Tower 3',1,1,0,'2026-05-21 07:29:02'),(63,'E006',37,14.53297150,120.98824790,'S Residence Tower 3',1,1,0,'2026-05-21 07:29:02'),(64,'E006',37,14.53228210,120.98826610,'S Residence Tower 3',1,1,0,'2026-05-21 07:29:02'),(65,'E006',37,14.53294410,120.98823860,'S Residence Tower 3',1,1,0,'2026-05-21 07:29:02'),(66,'E006',37,14.53293320,120.98823370,'S Residence Tower 3',1,1,0,'2026-05-21 07:29:02'),(67,'E006',37,14.53294390,120.98823160,'S Residence Tower 3',1,1,0,'2026-05-21 07:29:02'),(68,'E006',37,14.53299800,120.98820020,'S Residence Tower 3',1,1,0,'2026-05-21 07:29:02'),(69,'E006',37,14.53294390,120.98823160,'S Residence Tower 3',1,1,0,'2026-05-21 07:29:02'),(70,'E006',37,14.53294290,120.98823060,'S Residence Tower 3',1,1,0,'2026-05-21 07:32:30'),(71,'E006',37,14.53297930,120.98818590,'S Residence Tower 3',1,1,0,'2026-05-21 07:32:44'),(72,'E006',37,14.53295630,120.98820790,'S Residence Tower 3',1,1,0,'2026-05-21 07:33:05'),(73,'E006',37,14.53298620,120.98817360,'S Residence Tower 3',1,1,0,'2026-05-21 07:33:26'),(74,'E006',37,14.53320490,120.98827050,'S Residence Tower 3',1,1,0,'2026-05-21 07:34:06'),(75,'E006',37,14.53394270,120.98846100,'S Residence Tower 3',1,1,0,'2026-05-21 07:36:34'),(76,'E006',37,14.53292060,120.98822400,'S Residence Tower 3',1,1,0,'2026-05-21 07:36:41'),(77,'E006',37,14.53334500,120.98820400,'S Residence Tower 3',1,1,0,'2026-05-21 07:36:47'),(78,'E006',37,14.53290970,120.98822190,'S Residence Tower 3',1,1,0,'2026-05-21 07:37:13'),(79,'E006',37,14.53309650,120.98836280,'S Residence Tower 3',1,1,0,'2026-05-21 07:37:30'),(80,'E006',37,14.53309790,120.98836580,'S Residence Tower 3',1,1,0,'2026-05-21 07:37:52'),(81,'E006',37,14.53295470,120.98821570,'S Residence Tower 3',1,1,0,'2026-05-21 07:37:55'),(82,'E006',37,14.53387960,120.98820690,'S Residence Tower 3',1,1,0,'2026-05-21 07:38:16'),(83,'E006',37,14.53294750,120.98821820,'S Residence Tower 3',1,1,0,'2026-05-21 07:38:37'),(84,'E006',37,14.53390220,120.98823900,'S Residence Tower 3',1,1,0,'2026-05-21 07:41:22'),(85,'E006',37,14.53335480,120.98804890,'S Residence Tower 3',1,1,0,'2026-05-21 07:41:22'),(86,'E006',37,14.53335480,120.98804890,'S Residence Tower 3',1,1,0,'2026-05-21 07:41:22'),(87,'E006',37,14.53351940,120.98808740,'S Residence Tower 3',1,1,0,'2026-05-21 07:41:23'),(88,'E006',37,14.53351470,120.98809650,'S Residence Tower 3',1,1,0,'2026-05-21 07:41:23'),(89,'E006',37,14.53354630,120.98805950,'S Residence Tower 3',1,1,0,'2026-05-21 07:41:23'),(90,'E006',37,14.53354630,120.98805950,'S Residence Tower 3',1,1,0,'2026-05-21 07:41:23'),(91,'E006',37,14.53379880,120.98828700,'S Residence Tower 3',1,1,0,'2026-05-21 07:41:23'),(92,'E006',37,14.53402860,120.98831490,'S Residence Tower 3',1,1,0,'2026-05-21 07:41:25'),(93,'E006',37,14.53298390,120.98818360,'S Residence Tower 3',1,1,0,'2026-05-21 07:41:45'),(94,'E006',37,14.53294340,120.98823410,'S Residence Tower 3',1,1,0,'2026-05-21 07:42:06'),(95,'E006',37,14.53319300,120.98824320,'S Residence Tower 3',1,1,0,'2026-05-21 07:42:27'),(96,'E006',37,14.53290990,120.98821370,'S Residence Tower 3',1,1,0,'2026-05-21 07:42:48'),(97,'E006',37,14.53299330,120.98833950,'S Residence Tower 3',1,1,0,'2026-05-21 07:43:05'),(98,'E006',37,14.53299240,120.98833940,'S Residence Tower 3',1,1,0,'2026-05-21 07:43:26'),(99,'E006',37,14.53293630,120.98820960,'S Residence Tower 3',1,1,0,'2026-05-21 07:43:30'),(100,'E006',37,14.53304430,120.98826260,'S Residence Tower 3',1,1,0,'2026-05-21 07:44:04'),(101,'E006',37,14.53291370,120.98822650,'S Residence Tower 3',1,1,0,'2026-05-21 07:44:08'),(102,'E006',37,14.53284610,120.98835510,'S Residence Tower 3',1,1,0,'2026-05-21 07:44:29'),(103,'E006',37,14.53295690,120.98820090,'S Residence Tower 3',1,1,0,'2026-05-21 07:44:50'),(104,'E006',37,14.53317030,120.98836720,'S Residence Tower 3',1,1,0,'2026-05-21 07:45:10'),(105,'E006',37,14.53290730,120.98823020,'S Residence Tower 3',1,1,0,'2026-05-21 07:45:31'),(106,'E006',37,14.53295510,120.98821760,'S Residence Tower 3',1,1,0,'2026-05-21 07:46:03'),(107,'E006',37,14.53284570,120.98835830,'S Residence Tower 3',1,1,0,'2026-05-21 07:46:24'),(108,'E006',37,14.53276360,120.98832370,'S Residence Tower 3',1,1,0,'2026-05-21 07:46:45'),(109,'E006',37,14.53254810,120.98826780,'S Residence Tower 3',1,1,0,'2026-05-21 07:47:06'),(110,'E006',37,14.53296730,120.98818570,'S Residence Tower 3',1,1,0,'2026-05-21 07:47:27'),(111,'E006',37,14.53285490,120.98814970,'S Residence Tower 3',1,1,0,'2026-05-21 07:47:47'),(112,'E006',37,14.53275070,120.98825970,'S Residence Tower 3',1,1,0,'2026-05-21 07:48:04'),(113,'E006',37,14.53275070,120.98824990,'S Residence Tower 3',1,1,0,'2026-05-21 07:48:26'),(114,'E006',37,14.53294340,120.98823570,'S Residence Tower 3',1,1,0,'2026-05-21 07:48:29'),(115,'E006',37,14.53292780,120.98827230,'S Residence Tower 3',1,1,0,'2026-05-21 07:48:49'),(116,'E006',37,14.53294350,120.98822610,'S Residence Tower 3',1,1,0,'2026-05-21 07:49:10'),(117,'E006',37,14.53296390,120.98829630,'S Residence Tower 3',1,1,0,'2026-05-21 07:49:31'),(118,'E006',37,14.53296500,120.98818060,'S Residence Tower 3',1,1,0,'2026-05-21 07:49:52'),(119,'E006',37,14.53323680,120.98834480,'S Residence Tower 3',1,1,0,'2026-05-21 07:50:13'),(120,'E006',37,14.53301290,120.98831800,'S Residence Tower 3',1,1,0,'2026-05-21 07:50:54'),(121,'E006',37,14.53294790,120.98821860,'S Residence Tower 3',1,1,0,'2026-05-21 07:51:15'),(122,'E006',37,14.53295700,120.98822620,'S Residence Tower 3',1,1,0,'2026-05-21 07:51:35'),(123,'E006',37,14.53295970,120.98820560,'S Residence Tower 3',1,1,0,'2026-05-21 07:51:56'),(124,'E006',37,14.53294410,120.98821660,'S Residence Tower 3',1,1,0,'2026-05-21 07:52:17'),(125,'E006',37,14.53295190,120.98822810,'S Residence Tower 3',1,1,0,'2026-05-21 07:52:38'),(126,'E006',37,14.53301430,120.98834640,'S Residence Tower 3',1,1,0,'2026-05-21 08:08:33'),(127,'E006',37,14.53282380,120.98834110,'S Residence Tower 3',1,1,0,'2026-05-21 08:08:55'),(128,'E006',37,14.53295720,120.98821530,'S Residence Tower 3',1,1,0,'2026-05-21 08:09:37'),(129,'E006',37,14.53294800,120.98823150,'S Residence Tower 3',1,1,0,'2026-05-21 08:09:58'),(130,'E006',37,14.53300410,120.98821380,'S Residence Tower 3',1,1,0,'2026-05-21 08:10:28'),(131,'E006',37,14.53300410,120.98821380,'S Residence Tower 3',1,1,0,'2026-05-21 08:10:40'),(132,'E006',37,14.53296440,120.98821840,'S Residence Tower 3',1,1,0,'2026-05-21 08:11:02'),(133,'E006',37,14.53295810,120.98821840,'S Residence Tower 3',1,1,0,'2026-05-21 08:11:57'),(134,'E006',37,14.53293150,120.98821400,'S Residence Tower 3',1,1,0,'2026-05-21 08:11:57'),(135,'E006',37,14.53297640,120.98820090,'S Residence Tower 3',1,1,0,'2026-05-21 08:12:05'),(136,'E006',37,14.53296570,120.98821400,'S Residence Tower 3',1,1,0,'2026-05-21 08:12:26'),(137,'E006',37,14.53295440,120.98822570,'S Residence Tower 3',1,1,0,'2026-05-21 08:12:46'),(138,'E006',37,14.53319040,120.98847820,'S Residence Tower 3',1,1,0,'2026-05-21 08:13:07'),(139,'E006',37,14.53294390,120.98823410,'S Residence Tower 3',1,1,0,'2026-05-21 08:13:27'),(140,'E006',37,14.53296450,120.98820620,'S Residence Tower 3',1,1,0,'2026-05-21 08:13:47'),(141,'E006',37,14.53292540,120.98820860,'S Residence Tower 3',1,1,0,'2026-05-21 08:14:08'),(142,'E006',37,14.53295090,120.98822560,'S Residence Tower 3',1,1,0,'2026-05-21 08:14:29'),(143,'E006',37,14.53297320,120.98820130,'S Residence Tower 3',1,1,0,'2026-05-21 08:14:50'),(144,'E006',37,14.53295230,120.98823130,'S Residence Tower 3',1,1,0,'2026-05-21 08:15:11'),(145,'E006',37,14.53316010,120.98817040,'S Residence Tower 3',1,1,0,'2026-05-21 08:15:32'),(146,'E006',37,14.53295760,120.98821730,'S Residence Tower 3',1,1,0,'2026-05-21 08:15:53'),(147,'E006',37,14.53294960,120.98822920,'S Residence Tower 3',1,1,0,'2026-05-21 08:16:13'),(148,'E006',37,14.53294580,120.98821940,'S Residence Tower 3',1,1,0,'2026-05-21 08:16:34'),(149,'E006',37,14.53296030,120.98819580,'S Residence Tower 3',1,1,0,'2026-05-21 08:16:56'),(150,'E006',37,14.53292330,120.98822620,'S Residence Tower 3',1,1,0,'2026-05-21 08:17:04'),(151,'E006',37,14.53345400,120.98820200,'S Residence Tower 3',1,1,0,'2026-05-21 08:17:23'),(152,'E006',37,14.53297300,120.98820740,'S Residence Tower 3',1,1,0,'2026-05-21 08:17:44'),(153,'E006',37,14.53295240,120.98822650,'S Residence Tower 3',1,1,0,'2026-05-21 08:18:05'),(154,'E006',37,14.53295020,120.98822940,'S Residence Tower 3',1,1,0,'2026-05-21 08:18:26'),(155,'E006',37,14.53295560,120.98822380,'S Residence Tower 3',1,1,0,'2026-05-21 08:18:47'),(156,'E006',37,14.53296760,120.98820150,'S Residence Tower 3',1,1,0,'2026-05-21 08:19:09'),(157,'E006',37,14.53295250,120.98822770,'S Residence Tower 3',1,1,0,'2026-05-21 08:19:29'),(158,'E006',37,14.53280310,120.98813160,'S Residence Tower 3',1,1,0,'2026-05-21 08:19:50'),(159,'E006',37,14.53294140,120.98820590,'S Residence Tower 3',1,1,0,'2026-05-21 08:20:12'),(160,'E006',37,14.53293890,120.98822880,'S Residence Tower 3',1,1,0,'2026-05-21 08:20:33'),(161,'E006',37,14.53296780,120.98820160,'S Residence Tower 3',1,1,0,'2026-05-21 08:20:54'),(162,'E006',37,14.53284140,120.98820330,'S Residence Tower 3',1,1,0,'2026-05-21 08:21:15'),(163,'E006',37,14.53292780,120.98821060,'S Residence Tower 3',1,1,0,'2026-05-21 08:21:36'),(164,'E006',37,14.53295590,120.98823430,'S Residence Tower 3',1,1,0,'2026-05-21 08:21:57'),(165,'E006',37,14.53301330,120.98815960,'S Residence Tower 3',1,1,0,'2026-05-21 08:22:18'),(166,'E006',37,14.53338370,120.98809050,'S Residence Tower 3',1,1,0,'2026-05-21 08:25:51'),(167,'E006',37,14.53302740,120.98796740,'S Residence Tower 3',1,1,0,'2026-05-21 08:26:01'),(168,'E006',37,14.53299700,120.98806420,'S Residence Tower 3',1,1,0,'2026-05-21 08:26:19'),(169,'E006',37,14.53299250,120.98813460,'S Residence Tower 3',1,1,0,'2026-05-21 08:26:47'),(170,'E006',37,14.53315240,120.98814450,'S Residence Tower 3',1,1,0,'2026-05-21 08:27:07'),(171,'E006',37,14.53303300,120.98817300,'S Residence Tower 3',1,1,0,'2026-05-21 08:27:27'),(172,'E006',37,14.53318400,120.98818410,'S Residence Tower 3',1,1,0,'2026-05-21 08:27:47'),(173,'E006',37,14.53307590,120.98829660,'S Residence Tower 3',1,1,0,'2026-05-21 08:28:27'),(174,'E006',37,14.53306110,120.98837310,'S Residence Tower 3',1,1,0,'2026-05-21 08:28:46'),(175,'E006',37,14.53309870,120.98868710,'S Residence Tower 3',1,1,0,'2026-05-21 08:29:07'),(176,'E006',37,14.53329680,120.98871880,'S Residence Tower 3',1,1,0,'2026-05-21 08:29:47'),(177,'E006',37,14.53277970,120.98917330,'S Residence Tower 3',1,1,0,'2026-05-21 08:30:26'),(178,'E006',37,14.53226240,120.98969360,'S Residence Tower 3',0,1,0,'2026-05-21 08:30:46'),(179,'E006',37,14.53210310,120.98934520,'S Residence Tower 3',0,1,0,'2026-05-21 08:31:07'),(180,'E006',37,14.53279430,120.98850040,'S Residence Tower 3',1,1,0,'2026-05-21 08:33:16'),(181,'E006',37,14.53193880,120.98872890,'S Residence Tower 3',0,1,0,'2026-05-21 08:40:10'),(182,'E006',37,14.53173850,120.98872090,'S Residence Tower 3',0,1,0,'2026-05-21 08:40:36'),(183,'E006',37,14.53158670,120.98853070,'S Residence Tower 3',0,1,0,'2026-05-21 08:40:56'),(184,'E006',37,14.53150620,120.98821200,'S Residence Tower 3',0,1,0,'2026-05-21 08:44:22'),(185,'E006',37,14.53312340,120.98787920,'S Residence Tower 3',1,1,0,'2026-05-21 08:44:22'),(186,'E006',37,14.53312520,120.98787910,'S Residence Tower 3',1,1,0,'2026-05-21 08:46:09'),(187,'E006',37,14.53312520,120.98787910,'S Residence Tower 3',1,1,0,'2026-05-21 08:46:09'),(188,'E006',37,14.53343960,120.98727630,'S Residence Tower 3',1,1,0,'2026-05-21 08:46:09'),(189,'E006',37,14.53309340,120.98791000,'S Residence Tower 3',1,1,0,'2026-05-21 08:46:10'),(190,'E006',37,14.53304820,120.98795460,'S Residence Tower 3',1,1,0,'2026-05-21 08:54:41'),(191,'E006',37,14.53287230,120.98823940,'S Residence Tower 3',1,1,0,'2026-05-21 08:55:03'),(192,'E006',37,14.53296340,120.98821820,'S Residence Tower 3',1,1,0,'2026-05-21 08:55:24'),(193,'E006',37,14.53307160,120.98816810,'S Residence Tower 3',1,1,0,'2026-05-21 08:55:45'),(194,'E006',37,14.53291290,120.98823330,'S Residence Tower 3',1,1,0,'2026-05-21 08:56:05'),(195,'E006',37,14.53293940,120.98820910,'S Residence Tower 3',1,1,0,'2026-05-21 08:56:26'),(196,'E006',37,14.53283760,120.98826360,'S Residence Tower 3',1,1,0,'2026-05-21 08:56:47'),(197,'E006',37,14.53289900,120.98811560,'S Residence Tower 3',1,1,0,'2026-05-21 08:57:21'),(198,'E006',37,14.53296620,120.98821130,'S Residence Tower 3',1,1,0,'2026-05-21 08:57:44'),(199,'E006',37,14.53339490,120.98820620,'S Residence Tower 3',1,1,0,'2026-05-21 08:58:21'),(200,'E006',37,14.53290920,120.98823020,'S Residence Tower 3',1,1,0,'2026-05-21 09:10:52'),(201,'E006',37,14.53297080,120.98818180,'S Residence Tower 3',1,1,0,'2026-05-21 09:11:10'),(202,'E006',37,14.53294940,120.98819700,'S Residence Tower 3',1,1,0,'2026-05-21 09:11:43'),(203,'E006',37,14.53300330,120.98818910,'S Residence Tower 3',1,1,0,'2026-05-21 09:12:04'),(204,'E006',37,14.53321450,120.98818070,'S Residence Tower 3',1,1,0,'2026-05-21 09:12:24'),(205,'E006',37,14.53289630,120.98822450,'S Residence Tower 3',1,1,0,'2026-05-21 09:13:19'),(206,'E006',37,14.53289630,120.98822450,'S Residence Tower 3',1,1,0,'2026-05-21 09:13:32'),(207,'E006',37,14.53312600,120.98824630,'S Residence Tower 3',1,1,0,'2026-05-21 09:13:58'),(208,'E006',37,14.53312780,120.98824710,'S Residence Tower 3',1,1,0,'2026-05-21 09:14:23'),(209,'E006',37,14.53316710,120.98822060,'S Residence Tower 3',1,1,0,'2026-05-21 09:14:43'),(210,'E006',37,14.53309770,120.98829530,'S Residence Tower 3',1,1,0,'2026-05-21 09:24:18'),(211,'E006',37,14.53309770,120.98829530,'S Residence Tower 3',1,1,0,'2026-05-21 09:24:20'),(212,'E006',37,14.53301140,120.98832080,'S Residence Tower 3',1,1,0,'2026-05-21 09:24:49'),(213,'E006',37,14.53294940,120.98822830,'S Residence Tower 3',1,1,0,'2026-05-21 09:25:20'),(214,'E006',37,14.53292870,120.98823130,'S Residence Tower 3',1,1,0,'2026-05-21 09:25:41'),(215,'E006',37,14.53333080,120.98825150,'S Residence Tower 3',1,1,0,'2026-05-21 09:26:01'),(216,'E006',37,14.53316480,120.98831660,'S Residence Tower 3',1,1,0,'2026-05-21 09:26:22'),(217,'E006',37,14.53296250,120.98822710,'S Residence Tower 3',1,1,0,'2026-05-21 09:26:43'),(218,'E006',37,14.53294540,120.98822220,'S Residence Tower 3',1,1,0,'2026-05-21 09:27:03'),(219,'E006',37,14.53327650,120.98824290,'S Residence Tower 3',1,1,0,'2026-05-21 09:28:21'),(220,'E006',37,14.53294000,120.98821550,'S Residence Tower 3',1,1,0,'2026-05-21 09:28:40'),(221,'E006',37,14.53328830,120.98832680,'S Residence Tower 3',1,1,0,'2026-05-21 09:29:04'),(222,'E006',37,14.53316010,120.98823880,'S Residence Tower 3',1,1,0,'2026-05-21 09:29:42'),(223,'E006',37,14.53316010,120.98823880,'S Residence Tower 3',1,1,0,'2026-05-21 09:29:46'),(224,'E006',37,14.53294670,120.98822340,'S Residence Tower 3',1,1,0,'2026-05-21 09:30:06'),(225,'E006',37,14.53296080,120.98823560,'S Residence Tower 3',1,1,0,'2026-05-21 09:30:27'),(226,'E006',37,14.53278550,120.98821970,'S Residence Tower 3',1,1,0,'2026-05-21 10:13:42'),(227,'E006',37,14.53319840,120.98827590,'S Residence Tower 3',1,1,0,'2026-05-21 10:14:04'),(228,'E006',37,14.53319840,120.98827590,'S Residence Tower 3',1,1,0,'2026-05-21 10:14:05'),(229,'E006',37,14.53335270,120.98824790,'S Residence Tower 3',1,1,0,'2026-05-21 10:14:24'),(230,'E006',37,14.53315380,120.98822700,'S Residence Tower 3',1,1,0,'2026-05-21 10:14:44'),(231,'E006',37,14.53315890,120.98822560,'S Residence Tower 3',1,1,0,'2026-05-21 10:15:09'),(232,'E006',37,14.53318210,120.98853520,'S Residence Tower 3',1,1,0,'2026-05-21 10:15:29'),(233,'E006',37,14.53294050,120.98821780,'S Residence Tower 3',1,1,0,'2026-05-21 10:15:50'),(234,'E006',37,14.53316430,120.98824110,'S Residence Tower 3',1,1,0,'2026-05-21 10:16:11'),(235,'E006',37,14.53290450,120.98830580,'S Residence Tower 3',1,1,0,'2026-05-21 10:16:49'),(236,'E006',37,14.53290450,120.98830580,'S Residence Tower 3',1,1,0,'2026-05-21 10:16:50'),(237,'E006',37,14.53289170,120.98828230,'S Residence Tower 3',1,1,0,'2026-05-21 10:17:12'),(238,'E006',37,14.53299870,120.98828900,'S Residence Tower 3',1,1,0,'2026-05-21 10:17:49'),(239,'E006',37,14.53326470,120.98817720,'S Residence Tower 3',1,1,0,'2026-05-21 10:18:26'),(240,'E006',37,14.53339570,120.98831440,'S Residence Tower 3',1,1,0,'2026-05-21 10:18:50'),(241,'E006',37,14.53338440,120.98831710,'S Residence Tower 3',1,1,0,'2026-05-21 10:19:14'),(242,'E006',37,14.53333950,120.98822960,'S Residence Tower 3',1,1,0,'2026-05-21 10:19:53'),(243,'E006',37,14.53322250,120.98835810,'S Residence Tower 3',1,1,0,'2026-05-21 10:20:18'),(244,'E006',37,14.53313750,120.98836150,'S Residence Tower 3',1,1,0,'2026-05-21 10:20:39'),(245,'E006',37,14.53319100,120.98826680,'S Residence Tower 3',1,1,0,'2026-05-21 10:21:10'),(246,'E006',37,14.53292140,120.98821260,'S Residence Tower 3',1,1,0,'2026-05-21 10:21:40'),(247,'E006',37,14.53292240,120.98820770,'S Residence Tower 3',1,1,0,'2026-05-21 10:22:06'),(248,'E006',37,14.53295170,120.98823560,'S Residence Tower 3',1,1,0,'2026-05-21 10:22:27'),(249,'E006',37,14.53305920,120.98828930,'S Residence Tower 3',1,1,0,'2026-05-21 10:22:45'),(250,'E006',37,14.53332210,120.98832270,'S Residence Tower 3',1,1,0,'2026-05-21 10:23:28'),(251,'E006',37,14.53326400,120.98829650,'S Residence Tower 3',1,1,0,'2026-05-21 10:24:06'),(252,'E006',37,14.53307300,120.98826000,'S Residence Tower 3',1,1,0,'2026-05-21 10:24:27'),(253,'E006',37,14.53307480,120.98828570,'S Residence Tower 3',1,1,0,'2026-05-21 10:25:06'),(254,'E006',37,14.53319060,120.98814880,'S Residence Tower 3',1,1,0,'2026-05-21 10:25:45'),(255,'E006',37,14.53342410,120.98818240,'S Residence Tower 3',1,1,0,'2026-05-21 10:26:06'),(256,'E006',37,14.53342270,120.98818340,'S Residence Tower 3',1,1,0,'2026-05-21 10:26:29'),(257,'E006',37,14.53308150,120.98832110,'S Residence Tower 3',1,1,0,'2026-05-21 10:27:10'),(258,'E006',37,14.53302630,120.98826200,'S Residence Tower 3',1,1,0,'2026-05-21 10:51:13'),(259,'E006',37,14.53302630,120.98826200,'S Residence Tower 3',1,1,0,'2026-05-21 10:51:26'),(260,'E006',37,14.53295300,120.98828650,'S Residence Tower 3',1,1,0,'2026-05-21 10:51:47'),(261,'E006',37,14.53285730,120.98841470,'S Residence Tower 3',1,1,0,'2026-05-21 10:52:15'),(262,'E006',37,14.53296550,120.98838110,'S Residence Tower 3',1,1,0,'2026-05-21 10:52:36'),(263,'E006',37,14.53306720,120.98827590,'S Residence Tower 3',1,1,0,'2026-05-21 10:52:56'),(264,'E006',37,14.53319370,120.98826490,'S Residence Tower 3',1,1,0,'2026-05-21 10:53:16'),(265,'E006',37,14.53332330,120.98817290,'S Residence Tower 3',1,1,0,'2026-05-21 10:53:36'),(266,'E006',37,14.53305280,120.98823350,'S Residence Tower 3',1,1,0,'2026-05-21 10:53:56'),(267,'E006',37,14.53318660,120.98829170,'S Residence Tower 3',1,1,0,'2026-05-21 10:54:16'),(268,'E006',37,14.53292560,120.98822750,'S Residence Tower 3',1,1,0,'2026-05-21 10:54:36'),(269,'E006',37,14.53317180,120.98818600,'S Residence Tower 3',1,1,0,'2026-05-21 10:54:57'),(270,'E006',37,14.53332210,120.98819110,'S Residence Tower 3',1,1,0,'2026-05-21 10:55:18'),(271,'E006',37,14.53361300,120.98821840,'S Residence Tower 3',1,1,0,'2026-05-21 10:55:56'),(272,'E006',37,14.53361300,120.98821840,'S Residence Tower 3',1,1,0,'2026-05-21 10:55:58'),(273,'E006',37,14.53339710,120.98819240,'S Residence Tower 3',1,1,0,'2026-05-21 11:03:25'),(274,'E006',37,14.53311910,120.98828200,'S Residence Tower 3',1,1,0,'2026-05-21 11:04:02'),(275,'E006',37,14.53311910,120.98828200,'S Residence Tower 3',1,1,0,'2026-05-21 11:04:06'),(276,'E006',37,14.53291880,120.98820740,'S Residence Tower 3',1,1,0,'2026-05-21 11:04:26'),(277,'E006',37,14.53307500,120.98832280,'S Residence Tower 3',1,1,0,'2026-05-21 11:04:47'),(278,'E006',37,14.53294440,120.98823660,'S Residence Tower 3',1,1,0,'2026-05-21 11:05:07'),(279,'E006',37,14.53307370,120.98825100,'S Residence Tower 3',1,1,0,'2026-05-21 11:05:28'),(280,'E006',37,14.53293110,120.98821890,'S Residence Tower 3',1,1,0,'2026-05-21 11:05:49'),(281,'E006',37,14.53300100,120.98827740,'S Residence Tower 3',1,1,0,'2026-05-21 11:06:09'),(282,'E006',37,14.53337020,120.98814490,'S Residence Tower 3',1,1,0,'2026-05-21 11:06:29'),(283,'E006',37,14.53337020,120.98814490,'S Residence Tower 3',1,1,0,'2026-05-21 11:07:10'),(284,'E006',37,14.53325440,120.98822310,'S Residence Tower 3',1,1,0,'2026-05-21 11:07:32'),(285,'E006',37,14.53338040,120.98811970,'S Residence Tower 3',1,1,0,'2026-05-21 11:08:13'),(286,'E006',37,14.53324840,120.98811360,'S Residence Tower 3',1,1,0,'2026-05-21 11:08:31'),(287,'E006',37,14.53324720,120.98811460,'S Residence Tower 3',1,1,0,'2026-05-21 11:08:55'),(288,'E006',37,14.53320510,120.98825490,'S Residence Tower 3',1,1,0,'2026-05-21 11:09:36'),(289,'E006',37,14.53315840,120.98821150,'S Residence Tower 3',1,1,0,'2026-05-21 11:14:25'),(290,'E006',37,14.53340690,120.98811800,'S Residence Tower 3',1,1,0,'2026-05-21 11:14:46'),(291,'E006',37,14.53342890,120.98802470,'S Residence Tower 3',1,1,0,'2026-05-21 11:15:06'),(292,'E006',37,14.53294940,120.98819990,'S Residence Tower 3',1,1,0,'2026-05-21 11:15:27'),(293,'E006',37,14.53338310,120.98805350,'S Residence Tower 3',1,1,0,'2026-05-21 11:15:48'),(294,'E006',37,14.53295100,120.98822470,'S Residence Tower 3',1,1,0,'2026-05-21 11:16:08'),(295,'E006',37,14.53294790,120.98823910,'S Residence Tower 3',1,1,0,'2026-05-21 11:16:28'),(296,'E006',37,14.53295130,120.98820410,'S Residence Tower 3',1,1,0,'2026-05-21 11:16:49'),(297,'E006',37,14.53295470,120.98819830,'S Residence Tower 3',1,1,0,'2026-05-21 11:17:09'),(298,'E006',37,14.53298310,120.98818050,'S Residence Tower 3',1,1,0,'2026-05-21 11:17:30'),(299,'E006',37,14.53301020,120.98828310,'S Residence Tower 3',1,1,0,'2026-05-21 11:17:47'),(300,'E006',37,14.53300790,120.98830680,'S Residence Tower 3',1,1,0,'2026-05-21 11:18:11'),(301,'E006',37,14.53293640,120.98819410,'S Residence Tower 3',1,1,0,'2026-05-21 11:18:53'),(302,'E006',37,14.53302520,120.98823530,'S Residence Tower 3',1,1,0,'2026-05-21 11:19:34'),(303,'E006',37,14.53297610,120.98833020,'S Residence Tower 3',1,1,0,'2026-05-21 11:19:54'),(304,'E006',37,14.53309000,120.98828510,'S Residence Tower 3',1,1,0,'2026-05-21 11:20:15'),(305,'E006',37,14.53313150,120.98825450,'S Residence Tower 3',1,1,0,'2026-05-21 11:20:36'),(306,'E006',37,14.53283370,120.98822550,'S Residence Tower 3',1,1,0,'2026-05-21 11:20:56'),(307,'E006',37,14.53304060,120.98817680,'S Residence Tower 3',1,1,0,'2026-05-21 11:21:38'),(308,'E006',37,14.53295410,120.98823750,'S Residence Tower 3',1,1,0,'2026-05-21 11:21:58'),(309,'E006',37,14.53290220,120.98820460,'S Residence Tower 3',1,1,0,'2026-05-21 11:22:40'),(310,'E006',37,14.53292840,120.98823500,'S Residence Tower 3',1,1,0,'2026-05-21 11:23:00'),(311,'E006',37,14.53294590,120.98822260,'S Residence Tower 3',1,1,0,'2026-05-21 11:23:21'),(312,'E006',37,14.53295020,120.98821680,'S Residence Tower 3',1,1,0,'2026-05-21 11:24:02'),(313,'E006',37,14.53296310,120.98820430,'S Residence Tower 3',1,1,0,'2026-05-21 11:24:23'),(314,'E006',37,14.53295070,120.98822980,'S Residence Tower 3',1,1,0,'2026-05-21 11:24:43'),(315,'E006',37,14.53291860,120.98822080,'S Residence Tower 3',1,1,0,'2026-05-21 11:25:24'),(316,'E006',37,14.53294540,120.98820250,'S Residence Tower 3',1,1,0,'2026-05-21 11:26:09'),(317,'E006',37,14.53287380,120.98825660,'S Residence Tower 3',1,1,0,'2026-05-21 11:26:25'),(318,'E006',37,14.53291110,120.98836470,'S Residence Tower 3',1,1,0,'2026-05-21 11:27:07'),(319,'E006',37,14.53297630,120.98826780,'S Residence Tower 3',1,1,0,'2026-05-21 11:27:45'),(320,'E006',37,14.53331030,120.98830110,'S Residence Tower 3',1,1,0,'2026-05-21 11:55:53'),(321,'E006',37,14.53302110,120.98835660,'S Residence Tower 3',1,1,0,'2026-05-21 11:56:15'),(322,'E006',37,14.53312830,120.98827470,'S Residence Tower 3',1,1,0,'2026-05-21 11:56:35'),(323,'E006',37,14.53336410,120.98824330,'S Residence Tower 3',1,1,0,'2026-05-21 11:56:56'),(324,'E006',37,14.53337060,120.98823330,'S Residence Tower 3',1,1,0,'2026-05-21 11:57:16'),(325,'E006',37,14.53296000,120.98821530,'S Residence Tower 3',1,1,0,'2026-05-21 11:57:37'),(326,'E006',37,14.53291910,120.98823570,'S Residence Tower 3',1,1,0,'2026-05-21 11:57:57'),(327,'E006',37,14.53315720,120.98824540,'S Residence Tower 3',1,1,0,'2026-05-21 11:58:18'),(328,'E006',37,14.53320320,120.98819480,'S Residence Tower 3',1,1,0,'2026-05-21 12:00:28'),(329,'E006',37,14.53295690,120.98820420,'S Residence Tower 3',1,1,0,'2026-05-21 12:00:38'),(330,'E006',37,14.53314170,120.98828600,'S Residence Tower 3',1,1,0,'2026-05-21 12:01:09'),(331,'E006',37,14.53293800,120.98818910,'S Residence Tower 3',1,1,0,'2026-05-21 12:01:30'),(332,'E006',37,14.53295710,120.98818440,'S Residence Tower 3',1,1,0,'2026-05-21 12:01:50'),(333,'E006',37,14.53301400,120.98821420,'S Residence Tower 3',1,1,0,'2026-05-21 12:02:09'),(334,'E006',37,14.53328620,120.98820260,'S Residence Tower 3',1,1,0,'2026-05-21 12:04:26'),(335,'E006',37,14.53328620,120.98820260,'S Residence Tower 3',1,1,0,'2026-05-21 12:04:41'),(336,'E006',37,14.53292330,120.98828140,'S Residence Tower 3',1,1,0,'2026-05-21 12:05:08'),(337,'E006',37,14.53327230,120.98835760,'S Residence Tower 3',1,1,0,'2026-05-21 12:05:28'),(338,'E006',37,14.53293600,120.98821890,'S Residence Tower 3',1,1,0,'2026-05-21 12:05:49'),(339,'E006',37,14.53279070,120.98827750,'S Residence Tower 3',1,1,0,'2026-05-21 12:08:42'),(340,'E006',37,14.53301170,120.98822470,'S Residence Tower 3',1,1,0,'2026-05-21 12:09:05'),(341,'E006',37,14.53286730,120.98827280,'S Residence Tower 3',1,1,0,'2026-05-21 12:09:46'),(342,'E006',37,14.53286600,120.98827850,'S Residence Tower 3',1,1,0,'2026-05-21 12:10:06'),(343,'E006',37,14.53292040,120.98821570,'S Residence Tower 3',1,1,0,'2026-05-21 12:13:13'),(344,'E006',37,14.53292040,120.98821570,'S Residence Tower 3',1,1,0,'2026-05-21 12:13:19'),(345,'E006',37,14.53311530,120.98821040,'S Residence Tower 3',1,1,0,'2026-05-21 12:13:45'),(346,'E006',37,14.53296110,120.98818030,'S Residence Tower 3',1,1,0,'2026-05-21 12:14:05'),(347,'E006',37,14.53300160,120.98819060,'S Residence Tower 3',1,1,0,'2026-05-21 12:14:26'),(348,'E006',37,14.53328510,120.98812070,'S Residence Tower 3',1,1,0,'2026-05-21 12:14:46'),(349,'E006',37,14.53328510,120.98812070,'S Residence Tower 3',1,1,0,'2026-05-21 12:15:06'),(350,'E006',37,14.53292720,120.98819340,'S Residence Tower 3',1,1,0,'2026-05-21 12:15:26'),(351,'E006',37,14.53331200,120.98823950,'S Residence Tower 3',1,1,0,'2026-05-21 12:15:46'),(352,'E006',37,14.53330530,120.98824610,'S Residence Tower 3',1,1,0,'2026-05-21 12:16:06'),(353,'E006',37,14.53326470,120.98825440,'S Residence Tower 3',1,1,0,'2026-05-21 12:16:27'),(354,'E006',37,14.53292320,120.98819830,'S Residence Tower 3',1,1,0,'2026-05-21 12:16:47'),(355,'E006',37,14.53307570,120.98818030,'S Residence Tower 3',1,1,0,'2026-05-21 12:17:07'),(356,'E006',37,14.53294640,120.98821560,'S Residence Tower 3',1,1,0,'2026-05-21 12:17:28'),(357,'E006',37,14.53321980,120.98826790,'S Residence Tower 3',1,1,0,'2026-05-21 12:17:48'),(358,'E006',37,14.53294160,120.98820420,'S Residence Tower 3',1,1,0,'2026-05-21 12:18:09'),(359,'E006',37,14.53317480,120.98817040,'S Residence Tower 3',1,1,0,'2026-05-21 12:18:29'),(360,'E006',37,14.53294030,120.98822200,'S Residence Tower 3',1,1,0,'2026-05-21 12:18:50'),(361,'E006',37,14.53283560,120.98828640,'S Residence Tower 3',1,1,0,'2026-05-21 12:19:10'),(362,'E006',37,14.53292260,120.98821120,'S Residence Tower 3',1,1,0,'2026-05-21 12:19:30'),(363,'E006',37,14.53311920,120.98825070,'S Residence Tower 3',1,1,0,'2026-05-21 12:19:51'),(364,'E006',37,14.53291470,120.98820150,'S Residence Tower 3',1,1,0,'2026-05-21 12:20:10'),(365,'E006',37,14.53293470,120.98818680,'S Residence Tower 3',1,1,0,'2026-05-21 12:20:31'),(366,'E006',37,14.53294880,120.98822740,'S Residence Tower 3',1,1,0,'2026-05-21 12:20:51'),(367,'E006',37,14.53293340,120.98835820,'S Residence Tower 3',1,1,0,'2026-05-21 12:21:12'),(368,'E006',37,14.53294270,120.98822470,'S Residence Tower 3',1,1,0,'2026-05-21 12:21:33'),(369,'E006',37,14.53302250,120.98850370,'S Residence Tower 3',1,1,0,'2026-05-21 12:21:53'),(370,'E006',37,14.53290980,120.98821330,'S Residence Tower 3',1,1,0,'2026-05-21 12:22:12'),(371,'E006',37,14.53314210,120.98838910,'S Residence Tower 3',1,1,0,'2026-05-21 15:53:59'),(372,'E006',33,14.53290410,120.98820410,'S Residence Tower 3',1,1,0,'2026-05-22 05:08:52'),(373,'E006',33,14.53290410,120.98820410,'S Residence Tower 3',1,1,0,'2026-05-22 05:08:55'),(374,'E006',33,14.53294430,120.98823360,'S Residence Tower 3',1,1,0,'2026-05-22 05:09:47'),(375,'E006',33,14.53294780,120.98820000,'S Residence Tower 3',1,1,0,'2026-05-22 05:10:08'),(376,'E006',33,14.53261080,120.98842650,'S Residence Tower 3',1,1,0,'2026-05-22 05:10:29'),(377,'E006',33,14.53294850,120.98821350,'S Residence Tower 3',1,1,0,'2026-05-22 05:10:49'),(378,'E006',33,14.53303970,120.98824530,'S Residence Tower 3',1,1,0,'2026-05-22 05:11:11'),(379,'E006',33,14.53294050,120.98821820,'S Residence Tower 3',1,1,0,'2026-05-22 05:11:32'),(380,'E006',33,14.53317600,120.98821410,'S Residence Tower 3',1,1,0,'2026-05-22 05:11:53'),(381,'E006',33,14.53294450,120.98820250,'S Residence Tower 3',1,1,0,'2026-05-22 05:12:13'),(382,'E006',33,14.53279340,120.98827650,'S Residence Tower 3',1,1,0,'2026-05-22 05:12:35'),(383,'E006',33,14.53289410,120.98821930,'S Residence Tower 3',1,1,0,'2026-05-22 05:12:55'),(384,'E006',33,14.53300930,120.98817100,'S Residence Tower 3',1,1,0,'2026-05-22 05:13:16'),(385,'E006',33,14.53293600,120.98822030,'S Residence Tower 3',1,1,0,'2026-05-22 05:13:37'),(386,'E006',33,14.53294440,120.98823170,'S Residence Tower 3',1,1,0,'2026-05-22 05:13:58'),(387,'E006',33,14.53310910,120.98833980,'S Residence Tower 3',1,1,0,'2026-05-22 05:14:35'),(388,'E006',33,14.53310910,120.98833980,'S Residence Tower 3',1,1,0,'2026-05-22 05:14:42'),(389,'E006',33,14.53295100,120.98819990,'S Residence Tower 3',1,1,0,'2026-05-22 05:15:06'),(390,'E006',33,14.53293330,120.98822400,'S Residence Tower 3',1,1,0,'2026-05-22 05:15:26'),(391,'E006',33,14.53293730,120.98821410,'S Residence Tower 3',1,1,0,'2026-05-22 05:15:47'),(392,'E006',33,14.53301680,120.98823110,'S Residence Tower 3',1,1,0,'2026-05-22 05:16:06'),(393,'E006',33,14.53299360,120.98824240,'S Residence Tower 3',1,1,0,'2026-05-22 05:16:28'),(394,'E006',33,14.53292250,120.98821540,'S Residence Tower 3',1,1,0,'2026-05-22 05:16:48'),(395,'E006',33,14.53289350,120.98820110,'S Residence Tower 3',1,1,0,'2026-05-22 05:17:09'),(396,'E006',33,14.53338350,120.98815030,'S Residence Tower 3',1,1,0,'2026-05-22 05:17:48'),(397,'E006',33,14.53293820,120.98820660,'S Residence Tower 3',1,1,0,'2026-05-22 05:18:18'),(398,'E006',33,14.53291560,120.98821960,'S Residence Tower 3',1,1,0,'2026-05-22 05:18:38'),(399,'E006',33,14.53290580,120.98821750,'S Residence Tower 3',1,1,0,'2026-05-22 05:18:59'),(400,'E006',33,14.53293080,120.98821470,'S Residence Tower 3',1,1,0,'2026-05-22 05:19:20'),(401,'E006',33,14.53292670,120.98821510,'S Residence Tower 3',1,1,0,'2026-05-22 05:19:54'),(402,'E006',33,14.53313250,120.98820200,'S Residence Tower 3',1,1,0,'2026-05-22 05:20:16'),(403,'E006',33,14.53298650,120.98817810,'S Residence Tower 3',1,1,0,'2026-05-22 05:20:44'),(404,'E006',33,14.53293710,120.98819910,'S Residence Tower 3',1,1,0,'2026-05-22 05:21:05'),(405,'E006',33,14.53295430,120.98820230,'S Residence Tower 3',1,1,0,'2026-05-22 05:21:26'),(406,'E006',33,14.53301570,120.98820770,'S Residence Tower 3',1,1,0,'2026-05-22 05:21:59'),(407,'E006',33,14.53291810,120.98834510,'S Residence Tower 3',1,1,0,'2026-05-22 05:22:40'),(408,'E006',33,14.53302840,120.98815800,'S Residence Tower 3',1,1,0,'2026-05-22 05:22:57'),(409,'E006',33,14.53316440,120.98814600,'S Residence Tower 3',1,1,0,'2026-05-22 06:02:23'),(410,'E006',33,14.53336230,120.98828540,'S Residence Tower 3',1,1,0,'2026-05-22 06:02:43'),(411,'E006',33,14.53295640,120.98824480,'S Residence Tower 3',1,1,0,'2026-05-22 06:03:03'),(412,'E006',33,14.53295270,120.98820830,'S Residence Tower 3',1,1,0,'2026-05-22 06:03:27'),(413,'E006',33,14.53336310,120.98824120,'S Residence Tower 3',1,1,0,'2026-05-22 06:03:48'),(414,'E006',33,14.53336710,120.98825660,'S Residence Tower 3',1,1,0,'2026-05-22 06:09:44'),(415,'E006',33,14.53336710,120.98825660,'S Residence Tower 3',1,1,0,'2026-05-22 06:09:45'),(416,'E006',33,14.53328990,120.98831030,'S Residence Tower 3',1,1,0,'2026-05-22 06:10:06'),(417,'E006',33,14.53307540,120.98828290,'S Residence Tower 3',1,1,0,'2026-05-22 06:10:27'),(418,'E006',33,14.53340630,120.98829170,'S Residence Tower 3',1,1,0,'2026-05-22 06:11:07'),(419,'E006',33,14.53320520,120.98832130,'S Residence Tower 3',1,1,0,'2026-05-22 06:11:47'),(420,'E006',33,14.53309390,120.98830040,'S Residence Tower 3',1,1,0,'2026-05-22 06:15:36'),(421,'E006',33,14.53326510,120.98828540,'S Residence Tower 3',1,1,0,'2026-05-22 06:15:54'),(422,'E006',33,14.53336030,120.98828080,'S Residence Tower 3',1,1,0,'2026-05-22 06:16:18'),(423,'E006',33,14.53326550,120.98828470,'S Residence Tower 3',1,1,0,'2026-05-22 06:16:39'),(424,'E006',33,14.53313340,120.98828310,'S Residence Tower 3',1,1,0,'2026-05-22 06:17:04'),(425,'E006',33,14.53297430,120.98819820,'S Residence Tower 3',1,1,0,'2026-05-22 06:17:25'),(426,'E006',33,14.53294480,120.98821580,'S Residence Tower 3',1,1,0,'2026-05-22 06:17:46'),(427,'E006',33,14.53297770,120.98824780,'S Residence Tower 3',1,1,0,'2026-05-22 06:18:06'),(428,'E006',33,14.53297490,120.98827660,'S Residence Tower 3',1,1,0,'2026-05-22 06:18:26'),(429,'E006',33,14.53292980,120.98830060,'S Residence Tower 3',1,1,0,'2026-05-22 06:30:04'),(430,'E006',33,14.53292980,120.98830060,'S Residence Tower 3',1,1,0,'2026-05-22 06:30:15'),(431,'E006',33,14.53318990,120.98837090,'S Residence Tower 3',1,1,0,'2026-05-22 06:30:45'),(432,'E006',33,14.53318520,120.98829090,'S Residence Tower 3',1,1,0,'2026-05-22 06:31:07'),(433,'E006',33,14.53292340,120.98823260,'S Residence Tower 3',1,1,0,'2026-05-22 06:31:28'),(434,'E006',33,14.53299130,120.98823910,'S Residence Tower 3',1,1,0,'2026-05-22 06:32:05'),(435,'E006',33,14.53331700,120.98824670,'S Residence Tower 3',1,1,0,'2026-05-22 06:32:26'),(436,'E006',33,14.53340720,120.98824980,'S Residence Tower 3',1,1,0,'2026-05-22 06:32:47'),(437,'E006',33,14.53308760,120.98825090,'S Residence Tower 3',1,1,0,'2026-05-22 06:41:12'),(438,'E006',33,14.53289810,120.98823170,'S Residence Tower 3',1,1,0,'2026-05-22 06:41:33'),(439,'E006',33,14.53315770,120.98824850,'S Residence Tower 3',1,1,0,'2026-05-22 06:41:54'),(440,'E006',33,14.53294400,120.98822310,'S Residence Tower 3',1,1,0,'2026-05-22 06:42:15'),(441,'E006',33,14.53296450,120.98820830,'S Residence Tower 3',1,1,0,'2026-05-22 06:42:36'),(442,'E006',33,14.53293510,120.98822230,'S Residence Tower 3',1,1,0,'2026-05-22 06:42:56'),(443,'E006',33,14.53297740,120.98819340,'S Residence Tower 3',1,1,0,'2026-05-22 06:43:17'),(444,'E006',33,14.53294350,120.98822500,'S Residence Tower 3',1,1,0,'2026-05-22 06:43:38'),(445,'E006',33,14.53319270,120.98826870,'S Residence Tower 3',1,1,0,'2026-05-22 06:43:59'),(446,'E006',33,14.53291960,120.98822020,'S Residence Tower 3',1,1,0,'2026-05-22 06:50:18'),(447,'E006',33,14.53329760,120.98826280,'S Residence Tower 3',1,1,0,'2026-05-22 06:50:52'),(448,'E006',33,14.53325450,120.98833010,'S Residence Tower 3',1,1,0,'2026-05-22 06:51:23'),(449,'E006',33,14.53319910,120.98823200,'S Residence Tower 3',1,1,0,'2026-05-22 06:51:44'),(450,'E006',33,14.53329080,120.98832330,'S Residence Tower 3',1,1,0,'2026-05-22 06:52:05'),(451,'E006',33,14.53342250,120.98827380,'S Residence Tower 3',1,1,0,'2026-05-22 06:52:26'),(452,'E006',33,14.53319090,120.98821750,'S Residence Tower 3',1,1,0,'2026-05-22 06:52:46'),(453,'E006',33,14.53333950,120.98827330,'S Residence Tower 3',1,1,0,'2026-05-22 06:53:07'),(454,'E006',33,14.53289830,120.98821410,'S Residence Tower 3',1,1,0,'2026-05-22 06:53:28'),(455,'E006',33,14.53325530,120.98831870,'S Residence Tower 3',1,1,0,'2026-05-22 07:03:35'),(456,'E006',33,14.53325530,120.98831870,'S Residence Tower 3',1,1,0,'2026-05-22 07:03:48'),(457,'E006',33,14.53327300,120.98831140,'S Residence Tower 3',1,1,0,'2026-05-22 07:04:28'),(458,'E006',33,14.53303910,120.98820140,'S Residence Tower 3',1,1,0,'2026-05-22 07:05:07'),(459,'E006',33,14.53296270,120.98821460,'S Residence Tower 3',1,1,0,'2026-05-22 07:05:47'),(460,'E006',33,14.53353170,120.98802810,'S Residence Tower 3',1,1,0,'2026-05-22 07:14:55'),(461,'E006',33,14.53555400,120.98494340,'S Residence Tower 3',0,1,0,'2026-05-22 07:17:18'),(462,'E006',33,14.53402890,120.98462130,'S Residence Tower 3',0,1,0,'2026-05-22 07:22:40'),(463,'E006',33,14.53330720,120.98828580,'S Residence Tower 3',1,1,0,'2026-05-22 07:23:14'),(464,'E006',33,14.53295560,120.98819140,'S Residence Tower 3',1,1,0,'2026-05-22 07:23:42'),(465,'E006',33,14.53323360,120.98828940,'S Residence Tower 3',1,1,0,'2026-05-22 07:24:03'),(466,'E006',33,14.53338730,120.98819390,'S Residence Tower 3',1,1,0,'2026-05-22 07:24:24'),(467,'E006',33,14.53315240,120.98832530,'S Residence Tower 3',1,1,0,'2026-05-22 07:24:42'),(468,'E006',33,14.53315560,120.98832530,'S Residence Tower 3',1,1,0,'2026-05-22 07:25:05'),(469,'E006',33,14.53320850,120.98827040,'S Residence Tower 3',1,1,0,'2026-05-22 07:25:25'),(470,'E006',33,14.53309780,120.98826700,'S Residence Tower 3',1,1,0,'2026-05-22 07:25:44'),(471,'E006',33,14.53309580,120.98826770,'S Residence Tower 3',1,1,0,'2026-05-22 07:26:07'),(472,'E006',33,14.53304700,120.98825030,'S Residence Tower 3',1,1,0,'2026-05-22 07:26:28'),(473,'E006',33,14.53296460,120.98822830,'S Residence Tower 3',1,1,0,'2026-05-22 07:26:49'),(474,'E006',33,14.53304210,120.98827090,'S Residence Tower 3',1,1,0,'2026-05-22 07:27:10'),(475,'E006',33,14.53324620,120.98826730,'S Residence Tower 3',1,1,0,'2026-05-22 07:27:49'),(476,'E006',33,14.53324620,120.98826730,'S Residence Tower 3',1,1,0,'2026-05-22 07:27:52'),(477,'E006',33,14.53311790,120.98829360,'S Residence Tower 3',1,1,0,'2026-05-22 07:28:13'),(478,'E006',33,14.53293990,120.98821790,'S Residence Tower 3',1,1,0,'2026-05-22 07:28:34'),(479,'E006',33,14.53306350,120.98827440,'S Residence Tower 3',1,1,0,'2026-05-22 07:29:10'),(480,'E006',33,14.53331430,120.98831650,'S Residence Tower 3',1,1,0,'2026-05-22 07:29:38'),(481,'E006',33,14.53328030,120.98826800,'S Residence Tower 3',1,1,0,'2026-05-22 07:30:22'),(482,'E006',33,14.53337290,120.98827100,'S Residence Tower 3',1,1,0,'2026-05-22 07:30:51'),(483,'E006',33,14.53315380,120.98831930,'S Residence Tower 3',1,1,0,'2026-05-22 07:31:12'),(484,'E006',33,14.53311250,120.98827290,'S Residence Tower 3',1,1,0,'2026-05-22 07:31:33'),(485,'E006',33,14.53308930,120.98828560,'S Residence Tower 3',1,1,0,'2026-05-22 07:32:12'),(486,'E006',33,14.53319300,120.98823050,'S Residence Tower 3',1,1,0,'2026-05-22 07:37:27'),(487,'E006',33,14.53325900,120.98826610,'S Residence Tower 3',1,1,0,'2026-05-22 07:37:46'),(488,'E006',33,14.53295440,120.98823180,'S Residence Tower 3',1,1,0,'2026-05-22 07:38:07'),(489,'E006',33,14.53316390,120.98827950,'S Residence Tower 3',1,1,0,'2026-05-22 07:38:28'),(490,'E006',33,14.53296860,120.98822360,'S Residence Tower 3',1,1,0,'2026-05-22 07:38:48'),(491,'E006',33,14.53335970,120.98821150,'S Residence Tower 3',1,1,0,'2026-05-22 07:39:27'),(492,'E006',33,14.53335970,120.98821150,'S Residence Tower 3',1,1,0,'2026-05-22 07:39:30'),(493,'E006',33,14.53298460,120.98833830,'S Residence Tower 3',1,1,0,'2026-05-22 07:40:09'),(494,'E006',33,14.53298460,120.98833830,'S Residence Tower 3',1,1,0,'2026-05-22 07:40:11'),(495,'E006',33,14.53309670,120.98830340,'S Residence Tower 3',1,1,0,'2026-05-22 07:40:32'),(496,'E006',33,14.53293160,120.98822820,'S Residence Tower 3',1,1,0,'2026-05-22 07:40:53'),(497,'E006',33,14.53294730,120.98832140,'S Residence Tower 3',1,1,0,'2026-05-22 07:41:13'),(498,'E006',33,14.53290340,120.98822170,'S Residence Tower 3',1,1,0,'2026-05-22 07:41:52'),(499,'E006',33,14.53297720,120.98828690,'S Residence Tower 3',1,1,0,'2026-05-22 07:42:14'),(500,'E006',33,14.53306700,120.98828330,'S Residence Tower 3',1,1,0,'2026-05-22 07:42:34'),(501,'E006',33,14.53306890,120.98828170,'S Residence Tower 3',1,1,0,'2026-05-22 07:42:59'),(502,'E006',33,14.53331310,120.98830520,'S Residence Tower 3',1,1,0,'2026-05-22 07:43:26'),(503,'E006',33,14.53322100,120.98813470,'S Residence Tower 3',1,1,0,'2026-05-22 07:43:54'),(504,'E006',33,14.53324170,120.98832940,'S Residence Tower 3',1,1,0,'2026-05-22 07:44:14'),(505,'E006',33,14.53351400,120.98836470,'S Residence Tower 3',1,1,0,'2026-05-22 07:44:53'),(506,'E006',33,14.53329440,120.98835280,'S Residence Tower 3',1,1,0,'2026-05-22 07:45:14'),(507,'E006',33,14.53332580,120.98834400,'S Residence Tower 3',1,1,0,'2026-05-22 07:45:52'),(508,'E006',33,14.53292160,120.98821400,'S Residence Tower 3',1,1,0,'2026-05-22 07:46:15'),(509,'E006',33,14.53296400,120.98823840,'S Residence Tower 3',1,1,0,'2026-05-22 07:47:06'),(510,'E006',33,14.53296140,120.98821690,'S Residence Tower 3',1,1,0,'2026-05-22 07:47:27'),(511,'E006',33,14.53291830,120.98821270,'S Residence Tower 3',1,1,0,'2026-05-22 07:47:48'),(512,'E006',33,14.53323250,120.98827290,'S Residence Tower 3',1,1,0,'2026-05-22 07:48:08'),(513,'E006',33,14.53295100,120.98822540,'S Residence Tower 3',1,1,0,'2026-05-22 07:48:28'),(514,'E006',33,14.53317030,120.98821840,'S Residence Tower 3',1,1,0,'2026-05-22 07:48:49'),(515,'E006',33,14.53294070,120.98821530,'S Residence Tower 3',1,1,0,'2026-05-22 07:51:32'),(516,'E006',33,14.53294070,120.98821530,'S Residence Tower 3',1,1,0,'2026-05-22 07:52:35'),(517,'E006',33,14.53296380,120.98821140,'S Residence Tower 3',1,1,0,'2026-05-22 07:52:55'),(518,'E006',33,14.53313360,120.98819840,'S Residence Tower 3',1,1,0,'2026-05-22 12:38:57');
/*!40000 ALTER TABLE `instructor_location_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_applicants`
--

DROP TABLE IF EXISTS `job_applicants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_applicants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `cover_letter` text,
  `resume_path` varchar(500) DEFAULT NULL,
  `status` enum('new','reviewed','shortlisted','rejected','hired') NOT NULL DEFAULT 'new',
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `score` decimal(5,2) DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `job_applicants_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_applicants`
--

LOCK TABLES `job_applicants` WRITE;
/*!40000 ALTER TABLE `job_applicants` DISABLE KEYS */;
INSERT INTO `job_applicants` VALUES (1,1,'Kim Jean Yap','yapkimjean@gmail.com','09263909480','afadfd','/uploads/resumes/resume_1778582970704-517722664.pdf','reviewed','2026-05-12 10:49:30',0.00,'2026-05-25 09:05:31'),(2,3,'Kim Jean Yap','yapkimjean@gmail.com','09469738712','asdsdsd','/uploads/resumes/resume_1779700008937-306107954.pdf','new','2026-05-25 09:06:48',0.00,'2026-05-25 09:12:28');
/*!40000 ALTER TABLE `job_applicants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_postings`
--

DROP TABLE IF EXISTS `job_postings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_postings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `description` text,
  `requirements` text,
  `employment_type` varchar(50) DEFAULT NULL,
  `status` enum('open','closed') DEFAULT 'open',
  `posted_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `location_type` varchar(50) DEFAULT 'On-site',
  `location` varchar(255) DEFAULT NULL,
  `salary_min` decimal(10,2) DEFAULT NULL,
  `salary_max` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `posted_by` (`posted_by`),
  CONSTRAINT `job_postings_ibfk_1` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_postings`
--

LOCK TABLES `job_postings` WRITE;
/*!40000 ALTER TABLE `job_postings` DISABLE KEYS */;
INSERT INTO `job_postings` VALUES (1,'NEED NEW SIMULATIONIST','EDUCATION','NEED ADAAafAFafADF','afDAFWFWfweSA','Full-time',NULL,15,'2026-05-12 10:23:11','On-site',NULL,NULL,NULL),(2,'Looking for new instructors','Education','adasfdas','afafa','Part-time','open',15,'2026-05-12 13:03:26','On-site',NULL,NULL,NULL),(3,'xcxc','xcczcz','zdzd','dsss','Full-time','open',15,'2026-05-25 09:05:57','On-site','zxzcz',12000.00,30000.00);
/*!40000 ALTER TABLE `job_postings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `request_date` datetime DEFAULT NULL,
  `reason` text,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `admin_remarks` text,
  `is_hidden` tinyint(1) DEFAULT '0',
  `type` varchar(50) NOT NULL DEFAULT 'Sick Leave',
  `image_url` varchar(500) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES (2,'E002',NULL,NULL,'2026-04-14 00:00:00','family','Approved',NULL,1,'Emergency',NULL,'2026-04-30 15:57:25'),(3,'E002',NULL,NULL,'2026-04-17 00:00:00','manila','Approved',NULL,1,'Vacation',NULL,'2026-04-30 15:57:25'),(4,'E002',NULL,NULL,'2026-04-20 00:00:00','dddd','Rejected',NULL,1,'Emergency',NULL,'2026-04-30 15:57:25'),(5,'E002',NULL,NULL,'2026-04-22 00:00:00','sss','Rejected',NULL,0,'Sick Leave',NULL,'2026-04-30 15:57:25'),(6,'E002',NULL,NULL,'2026-05-05 00:00:00','lagnat','Approved',NULL,1,'Sick Leave',NULL,'2026-04-30 15:57:25'),(7,'E002',NULL,NULL,'2026-05-07 00:00:00','bday','Rejected',NULL,1,'Vacation',NULL,'2026-04-30 15:57:25'),(8,'E002',NULL,NULL,'2026-05-08 00:00:00','monthsary','Rejected',NULL,1,'Vacation',NULL,'2026-04-30 15:57:25'),(9,'E002',NULL,NULL,'2026-05-09 00:00:00','Anniv','Rejected',NULL,1,'Vacation',NULL,'2026-04-30 15:57:25'),(10,'E002',NULL,NULL,'2026-05-15 00:00:00','pain','Rejected',NULL,1,'Sick Leave',NULL,'2026-04-30 15:57:25'),(11,'E002',NULL,NULL,'2026-04-30 00:00:00','ss','Rejected',NULL,1,'Sick Leave',NULL,'2026-04-30 18:33:21'),(12,'E002',NULL,NULL,'2026-05-22 00:00:00','gd','Rejected',NULL,1,'Sick Leave',NULL,'2026-04-30 18:34:04'),(13,'E002',NULL,NULL,'2026-04-30 00:00:00','fsdfdd','Rejected',NULL,1,'Sick Leave',NULL,'2026-04-30 18:34:25'),(14,'E002',NULL,NULL,'2026-05-06 00:00:00','sick','Approved',NULL,1,'Sick Leave',NULL,'2026-05-05 15:38:07'),(15,'E002',NULL,NULL,'2026-05-07 00:00:00','Fever','Rejected',NULL,1,'Sick Leave',NULL,'2026-05-05 19:28:02'),(16,'E002',NULL,NULL,'2026-05-11 00:00:00','vacation','Rejected',NULL,0,'Sick Leave',NULL,'2026-05-08 08:17:44'),(17,'E006',NULL,NULL,'2026-05-12 00:00:00','sixk','Approved',NULL,1,'Sick Leave',NULL,'2026-05-10 15:43:20'),(18,'E006',NULL,NULL,'2026-05-16 00:00:00','Sick','Pending',NULL,0,'Sick Leave',NULL,'2026-05-15 04:20:49'),(19,'E006',NULL,NULL,'2026-05-19 00:00:00','Lslskdkd','Rejected',NULL,0,'Sick Leave',NULL,'2026-05-15 14:55:01'),(20,'E006',NULL,NULL,'2026-05-21 00:00:00','Bounce ka ako sah','Pending',NULL,0,'Sick Leave',NULL,'2026-05-19 10:28:18');
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_types`
--

DROP TABLE IF EXISTS `leave_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `annual_quota` decimal(5,2) NOT NULL,
  `carry_over_limit` decimal(5,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_types`
--

LOCK TABLES `leave_types` WRITE;
/*!40000 ALTER TABLE `leave_types` DISABLE KEYS */;
INSERT INTO `leave_types` VALUES (1,'Sick Leave',15.00,5.00,1),(2,'Vacation Leave',15.00,5.00,1),(3,'Emergency Leave',5.00,0.00,1);
/*!40000 ALTER TABLE `leave_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location_alerts`
--

DROP TABLE IF EXISTS `location_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location_alerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(20) NOT NULL,
  `schedule_id` int DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `alert_message` text NOT NULL,
  `is_resolved` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location_alerts`
--

LOCK TABLES `location_alerts` WRITE;
/*!40000 ALTER TABLE `location_alerts` DISABLE KEYS */;
INSERT INTO `location_alerts` VALUES (1,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 02:15:08'),(2,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 04:00:38'),(3,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 04:28:27'),(4,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 05:30:53'),(5,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 06:05:53'),(6,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 06:23:53'),(7,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 06:43:26'),(8,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 07:07:37'),(9,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 07:27:37'),(10,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 07:58:24'),(11,'E006',NULL,14.53226240,120.98969360,'Instructor outside campus during shift: S Residence Tower 3',0,'2026-05-21 08:30:46'),(12,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 08:38:24'),(13,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 09:03:25'),(14,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 09:20:25'),(15,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 09:36:25'),(16,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 10:32:25'),(17,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 11:03:18'),(18,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 11:33:11'),(19,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-21 15:53:59'),(20,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-22 05:34:36'),(21,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-22 06:09:36'),(22,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-22 06:38:36'),(23,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-22 06:58:36'),(24,'E006',NULL,14.53555400,120.98494340,'Instructor outside campus during shift: S Residence Tower 3',0,'2026-05-22 07:17:18'),(25,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-22 07:22:36'),(26,'E006',NULL,0.00000000,0.00000000,'Connection lost: Instructor GPS stopped responding.',0,'2026-05-22 12:38:57');
/*!40000 ALTER TABLE `location_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll`
--

DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `month_year` varchar(20) DEFAULT NULL,
  `salary_rate` decimal(10,2) DEFAULT '0.00',
  `total_hours` decimal(10,2) DEFAULT '0.00',
  `total_earnings` decimal(10,2) DEFAULT '0.00',
  `status` enum('paid','pending') DEFAULT 'pending',
  `gross_pay` decimal(10,2) DEFAULT '0.00',
  `tax_deduction` decimal(10,2) DEFAULT '0.00',
  `net_pay` decimal(10,2) DEFAULT '0.00',
  `overtime_hours` decimal(10,2) DEFAULT '0.00',
  `overtime_pay` decimal(10,2) DEFAULT '0.00',
  `transport_allowance` decimal(10,2) DEFAULT '0.00',
  `meal_allowance` decimal(10,2) DEFAULT '0.00',
  `housing_allowance` decimal(10,2) DEFAULT '0.00',
  `sss_deduction` decimal(10,2) DEFAULT '0.00',
  `philhealth_deduction` decimal(10,2) DEFAULT '0.00',
  `pagibig_deduction` decimal(10,2) DEFAULT '0.00',
  `loan_deduction` decimal(10,2) DEFAULT '0.00',
  `other_deduction` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll`
--

LOCK TABLES `payroll` WRITE;
/*!40000 ALTER TABLE `payroll` DISABLE KEYS */;
INSERT INTO `payroll` VALUES (1,NULL,'April 2026',200.00,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00),(2,NULL,'April 2026',200.00,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00),(3,NULL,'April 2026',200.00,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00),(4,NULL,'April 2026',200.00,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00),(5,NULL,'April 2026',200.00,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00),(6,NULL,'April 2026',200.00,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00),(7,NULL,'May 2026',200.00,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00),(9,5,'March 2026',170.45,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00),(10,6,'March 2026',170.45,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00),(14,5,'May 2025',170.45,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00),(15,6,'May 2025',170.45,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00),(19,5,'May 2026',170.45,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00),(20,6,'May 2026',170.45,0.00,0.00,'paid',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00);
/*!40000 ALTER TABLE `payroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_access_logs`
--

DROP TABLE IF EXISTS `payroll_access_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_access_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `accessed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payroll_access_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_access_logs`
--

LOCK TABLES `payroll_access_logs` WRITE;
/*!40000 ALTER TABLE `payroll_access_logs` DISABLE KEYS */;
INSERT INTO `payroll_access_logs` VALUES (1,9,'yapkimjean@gmail.com','2026-05-05 12:48:05'),(2,9,'yapkimjean@gmail.com','2026-05-05 12:48:32'),(3,9,'yapkimjean@gmail.com','2026-05-05 12:51:04'),(4,9,'yapkimjean@gmail.com','2026-05-05 14:04:47'),(5,9,'yapkimjean@gmail.com','2026-05-05 14:45:09'),(6,9,'yapkimjean@gmail.com','2026-05-05 15:26:54'),(7,9,'yapkimjean@gmail.com','2026-05-05 15:40:02'),(8,9,'yapkimjean@gmail.com','2026-05-05 16:13:01'),(9,9,'yapkimjean@gmail.com','2026-05-05 18:52:16'),(10,9,'yapkimjean@gmail.com','2026-05-06 03:08:10'),(11,9,'yapkimjean@gmail.com','2026-05-06 04:57:19'),(12,9,'yapkimjean@gmail.com','2026-05-06 04:58:27'),(13,15,'daennylyn@gmail.com','2026-05-10 12:13:59'),(14,15,'daennylyn@gmail.com','2026-05-10 12:52:12'),(15,15,'daennylyn@gmail.com','2026-05-10 13:02:41'),(16,15,'daennylyn@gmail.com','2026-05-10 13:09:09'),(17,15,'daennylyn@gmail.com','2026-05-10 13:09:20'),(18,15,'daennylyn@gmail.com','2026-05-12 11:21:39'),(19,15,'daennylyn@gmail.com','2026-05-12 13:03:52'),(20,15,'daennylyn@gmail.com','2026-05-12 14:46:30'),(21,15,'daennylyn@gmail.com','2026-05-14 12:45:02'),(22,15,'daennylyn@gmail.com','2026-05-16 10:14:56'),(23,9,'yapkimjean@gmail.com','2026-05-16 18:07:25'),(24,9,'yapkimjean@gmail.com','2026-05-16 18:12:01'),(25,9,'yapkimjean@gmail.com','2026-05-16 18:15:31'),(26,9,'yapkimjean@gmail.com','2026-05-17 05:01:22'),(27,9,'yapkimjean@gmail.com','2026-05-19 01:57:38'),(28,9,'yapkimjean@gmail.com','2026-05-19 02:40:42'),(29,15,'daennylyn@gmail.com','2026-05-19 02:43:41'),(30,9,'yapkimjean@gmail.com','2026-05-19 04:10:44'),(31,15,'daennylyn@gmail.com','2026-05-19 04:12:30'),(32,9,'yapkimjean@gmail.com','2026-05-19 06:42:39'),(33,15,'daennylyn@gmail.com','2026-05-19 10:00:59'),(34,9,'yapkimjean@gmail.com','2026-05-21 11:18:36'),(35,9,'yapkimjean@gmail.com','2026-05-25 08:11:21'),(36,15,'daennylyn@gmail.com','2026-05-25 09:12:41');
/*!40000 ALTER TABLE `payroll_access_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_evaluations`
--

DROP TABLE IF EXISTS `performance_evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance_evaluations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `evaluator_id` int NOT NULL,
  `type` enum('student_feedback','peer_review','supervisor_assessment') DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `comments` text,
  `evaluation_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `evaluator_id` (`evaluator_id`),
  CONSTRAINT `performance_evaluations_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `performance_evaluations_ibfk_2` FOREIGN KEY (`evaluator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_evaluations`
--

LOCK TABLES `performance_evaluations` WRITE;
/*!40000 ALTER TABLE `performance_evaluations` DISABLE KEYS */;
/*!40000 ALTER TABLE `performance_evaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resource` varchar(100) NOT NULL,
  `action` enum('can_view','can_edit','can_approve','can_delete') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_perm` (`resource`,`action`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (21,'appointment','can_edit'),(17,'appointment_validation','can_approve'),(13,'attendance','can_view'),(14,'attendance','can_approve'),(20,'attendance_appeal','can_edit'),(3,'audit_log','can_view'),(5,'employee_record','can_view'),(6,'employee_record','can_edit'),(7,'employee_record','can_approve'),(22,'job_application','can_edit'),(11,'leave_request','can_view'),(12,'leave_request','can_approve'),(18,'map_monitoring','can_view'),(23,'own_document','can_edit'),(19,'own_schedule','can_view'),(8,'payroll','can_view'),(9,'payroll','can_edit'),(10,'payroll','can_approve'),(1,'system_config','can_view'),(2,'system_config','can_edit'),(4,'user_role','can_edit'),(15,'visitor_checkin','can_view'),(16,'visitor_checkin','can_edit');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1),(1,2),(1,3),(1,4);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` enum('admin','hr','security','instructor','visitor') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Full system governance, audit, role assignment, config'),(2,'hr','Employee lifecycle, payroll, leave, attendance approvals'),(3,'security','Visitor check-in, map monitoring, flagging'),(4,'instructor','View own schedule, submit attendance appeals, view students (if any)'),(5,'visitor','Appointment requests, job applications, own document uploads');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_change_requests`
--

DROP TABLE IF EXISTS `schedule_change_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_change_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `request_type` enum('new','change') NOT NULL,
  `date` date NOT NULL,
  `place` varchar(255) DEFAULT NULL,
  `course` varchar(255) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `reason` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `schedule_change_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_change_requests`
--

LOCK TABLES `schedule_change_requests` WRITE;
/*!40000 ALTER TABLE `schedule_change_requests` DISABLE KEYS */;
INSERT INTO `schedule_change_requests` VALUES (1,'E006','Dr. John Lloyd T. Danzalan','new','2026-05-14','dssf','dfAfa','08:00:00','17:00:00','adfaf','approved',NULL,'2026-05-12 15:29:37'),(2,'E006','Dr. John Lloyd T. Danzalan','change','2026-05-14','dssf','dfAfaasaasa','08:00:00','17:00:00','adfaf','rejected',NULL,'2026-05-12 15:39:36'),(3,'E006','Dr. John Lloyd T. Danzalan','change','2026-05-14','dssf','dfAfaasaasaaaa','08:00:00','17:00:00','adfaf','rejected','adaddaaaa','2026-05-12 15:43:56'),(4,'E006','John Lloyd  T Danzalan','new','2026-05-22','Main Campus','Hsjsisks\n','09:00:00','17:00:00','Hsjsisks\n','approved',NULL,'2026-05-19 07:13:20');
/*!40000 ALTER TABLE `schedule_change_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `place` varchar(255) DEFAULT NULL,
  `course` varchar(255) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Scheduled',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES (2,'E002','2026-04-07','Room 331','Healthcare101','19:00:00','20:00:00','Scheduled'),(3,'E002','2026-04-13','Room 331','Healthcare101','08:00:00','17:00:00','Scheduled'),(5,'E002','2026-05-01','National University - Manila','Healthcare101','15:00:00','17:00:00','Scheduled'),(11,'E002','2026-05-02','S Residence Tower 3','BSIT','22:33:00','22:50:00','Scheduled'),(13,'E007','2026-05-02','Sun Residence Tower 1','BSIT','22:33:00','22:40:00','Scheduled'),(14,'E002','2026-05-08','HCT Academy Pasig','BSIT','08:00:00','09:00:00','Scheduled'),(15,'E007','2026-05-08','National University - Manila','Healthcare101','08:00:00','17:00:00','Scheduled'),(16,'E002','2026-05-11','HCT Academy Pasig','Allied Health 2','08:00:00','17:00:00','Scheduled'),(17,'E002','2026-05-12','Colegio de San Agustin - Bacolod','Healthcare101','08:00:00','17:00:00','Scheduled'),(18,'E002','2026-05-06','S Residence Tower 3','Healthcare101','03:32:00','04:00:00','Scheduled'),(19,'E009','2026-05-06','S Residence Tower 3','Healthcare101','03:34:00','04:00:00','Scheduled'),(20,'E006','2026-05-06','National University - MOA','Healthcare101','13:14:00','14:00:00','Scheduled'),(22,'E006','2026-05-16','Olivarez College Paranaque','Allied Health 2','08:00:00','17:00:00','Scheduled'),(23,'E006','2026-05-15','S Residence Tower 3','Allied Health 2','21:35:00','22:00:00','Scheduled'),(27,'','2026-05-19','S Residence Tower 3','Allied Health 2','13:27:00','13:29:00','Scheduled'),(30,'E006','2026-05-19','S Residence Tower 3','Allied Health 2','22:51:00','23:15:00','Scheduled'),(33,'E006','2026-05-22','S Residence Tower 3','Healthcare101','08:00:00','17:00:00','Scheduled'),(36,'','2026-05-21','S Residence Tower 3','Allied Health 2','08:10:00','09:00:00','Scheduled'),(37,'E006','2026-05-21','S Residence Tower 3','Healthcare101','08:15:00','09:00:00','Scheduled'),(38,'E006','2026-05-21','S Residence Tower 3','Healthcare101','10:00:00','16:40:00','Scheduled'),(39,'E006','2026-05-21','S Residence Tower 3','Allied Health 2','18:00:00','22:00:00','Scheduled');
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_locations`
--

DROP TABLE IF EXISTS `school_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `school_locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `latitude` decimal(10,7) NOT NULL DEFAULT '0.0000000',
  `longitude` decimal(10,7) NOT NULL DEFAULT '0.0000000',
  `radius` int NOT NULL DEFAULT '200',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_locations`
--

LOCK TABLES `school_locations` WRITE;
/*!40000 ALTER TABLE `school_locations` DISABLE KEYS */;
INSERT INTO `school_locations` VALUES (1,'HCT Academy Pasig',14.5747800,121.0607000,200),(2,'National University - Manila',14.6042947,120.9942832,200),(3,'Olivarez College Paranaque',14.4788410,120.9963350,200),(4,'Wesleyan University Philippines',15.4844880,120.9760450,200),(5,'Colegio de San Agustin - Bacolod',10.6626200,122.9764100,200),(6,'S Residence Tower 3',14.5334600,120.9880800,150),(7,'Sun Residence Tower 1',14.6182800,121.0005900,150),(8,'National University - MOA',14.5305700,120.9811000,200);
/*!40000 ALTER TABLE `school_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_config`
--

DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_config` (
  `id` int NOT NULL DEFAULT '1',
  `password_expiry_days` int DEFAULT '365',
  `otp_expiry_minutes` int DEFAULT '5',
  `geofence_default_radius` int DEFAULT '200',
  `max_login_attempts` int DEFAULT '5',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_config`
--

LOCK TABLES `system_config` WRITE;
/*!40000 ALTER TABLE `system_config` DISABLE KEYS */;
INSERT INTO `system_config` VALUES (1,365,5,200,5,'2026-05-16 17:40:01');
/*!40000 ALTER TABLE `system_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_chat_read`
--

DROP TABLE IF EXISTS `user_chat_read`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_chat_read` (
  `user_id` int NOT NULL,
  `room_id` int NOT NULL,
  `last_read_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`room_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `user_chat_read_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_chat_read_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_chat_read`
--

LOCK TABLES `user_chat_read` WRITE;
/*!40000 ALTER TABLE `user_chat_read` DISABLE KEYS */;
INSERT INTO `user_chat_read` VALUES (6,9,'2026-05-10 16:37:32'),(9,7,'2026-05-14 13:31:30'),(9,9,'2026-05-14 13:31:30'),(15,7,'2026-05-19 10:06:37'),(15,9,'2026-05-19 10:06:37'),(17,9,'2026-05-12 11:37:20');
/*!40000 ALTER TABLE `user_chat_read` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(20) NOT NULL,
  `title` varchar(50) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `middle_initial` varchar(50) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `password_last_changed` date DEFAULT (curdate()),
  `employment_type` enum('Full-time','Part-time','Provisionary') DEFAULT 'Full-time',
  `position_level` enum('Entry Level Simulationist','Senior Simulationist') DEFAULT 'Entry Level Simulationist',
  `contract_type` varchar(50) DEFAULT 'Regular',
  `monthly_salary` decimal(10,2) DEFAULT '30000.00',
  `work_days_per_month` int DEFAULT '22',
  `payroll_pin` varchar(6) DEFAULT '1234',
  `payroll_access` tinyint(1) DEFAULT '0',
  `role_id` int DEFAULT NULL,
  `fingerprint_hash` varchar(255) DEFAULT NULL COMMENT 'store hash of fingerprint template',
  `biometric_enabled` tinyint(1) DEFAULT '0',
  `temp_forgot_clock` json DEFAULT NULL COMMENT 'store pending attendance correction',
  `date_of_joining` date DEFAULT NULL,
  `account_expiration_date` date DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `gender` enum('male','female','other','prefer_not_to_say') DEFAULT 'prefer_not_to_say',
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `street_address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state_province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Philippines',
  `additional_info` text,
  `position` varchar(100) DEFAULT NULL,
  `last_location_ping` timestamp NULL DEFAULT NULL,
  `location_tracking_enabled` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `email` (`email`),
  KEY `users_ibfk_role` (`role_id`),
  CONSTRAINT `users_ibfk_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ADM01',NULL,NULL,NULL,NULL,'System Admin','admin@email.com','admin123','admin','deactivated','2026-02-10 13:01:42','2026-04-07','Full-time','Senior Simulationist','Regular',30000.00,22,'1234',0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'prefer_not_to_say',NULL,NULL,NULL,NULL,NULL,NULL,'Philippines',NULL,NULL,NULL,1),(5,'E003',NULL,NULL,NULL,NULL,'Dr. Maui S. Torres','mawie@gmail.com','emp1234','instructor','deactivated','2026-02-11 05:36:44','2026-04-07','Full-time','Entry Level Simulationist','Regular',30000.00,22,'1234',0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'prefer_not_to_say',NULL,NULL,NULL,NULL,NULL,NULL,'Philippines',NULL,NULL,NULL,1),(6,'E006',NULL,NULL,NULL,NULL,'John Lloyd  T Danzalan','danzi9012004@gmail.com','emp1234','instructor','active','2026-02-11 12:42:52','2026-05-11',NULL,'Entry Level Simulationist','Regular',32000.00,NULL,'1234',0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Philippines',NULL,NULL,'2026-05-22 12:38:57',0),(9,'ADM02',NULL,NULL,NULL,NULL,'Admin Kim','yapkimjean@gmail.com','admin123','admin','active','2026-05-04 14:57:24','2026-05-04','Full-time','Entry Level Simulationist','Regular',30000.00,22,'1234',0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'prefer_not_to_say',NULL,NULL,NULL,NULL,NULL,NULL,'Philippines',NULL,NULL,NULL,1),(15,'E007',NULL,NULL,NULL,NULL,'Alliah','daennylyn@gmail.com','emp007','hr_admin','active','2026-05-10 12:03:47','2026-05-10','Full-time','Entry Level Simulationist','Regular',30000.00,22,'1234',1,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'prefer_not_to_say',NULL,NULL,NULL,NULL,NULL,NULL,'Philippines',NULL,NULL,NULL,1),(17,'E008',NULL,NULL,NULL,NULL,'Kate','ykean119@gmail.com','emp008','security','active','2026-05-10 12:18:55','2026-05-10','Full-time','Entry Level Simulationist','Regular',30000.00,22,'1234',0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,'prefer_not_to_say',NULL,NULL,NULL,NULL,NULL,NULL,'Philippines',NULL,NULL,NULL,1),(25,'E009',NULL,NULL,NULL,NULL,'Thea S Martinez','theakmartinez@gmail.com','emp009','instructor','active','2026-05-21 11:16:47','2026-05-21',NULL,'Entry Level Simulationist','Full-time',NULL,NULL,'1234',0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Philippines',NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit_reasons`
--

DROP TABLE IF EXISTS `visit_reasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_reasons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reason_text` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_reasons`
--

LOCK TABLES `visit_reasons` WRITE;
/*!40000 ALTER TABLE `visit_reasons` DISABLE KEYS */;
INSERT INTO `visit_reasons` VALUES (1,'Meeting'),(5,'Facility Tour');
/*!40000 ALTER TABLE `visit_reasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitor_history`
--

DROP TABLE IF EXISTS `visitor_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitor_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visitor_id` varchar(50) NOT NULL,
  `visitor_name` varchar(255) NOT NULL,
  `ble_id` varchar(50) NOT NULL,
  `floor` varchar(10) DEFAULT NULL,
  `current_room` varchar(255) DEFAULT NULL,
  `event_type` enum('enter','move','exit') NOT NULL,
  `x` decimal(10,2) DEFAULT NULL,
  `y` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_visitor` (`visitor_id`),
  KEY `idx_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitor_history`
--

LOCK TABLES `visitor_history` WRITE;
/*!40000 ALTER TABLE `visitor_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `visitor_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitor_requests`
--

DROP TABLE IF EXISTS `visitor_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitor_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `visit_date` date NOT NULL,
  `visit_time` time NOT NULL,
  `reason` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','RESCHEDULED') DEFAULT 'PENDING',
  `admin_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_by` int DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `ble_id` varchar(50) DEFAULT NULL,
  `no_show` tinyint(1) DEFAULT '0',
  `no_show_at` timestamp NULL DEFAULT NULL,
  `arrived_at` timestamp NULL DEFAULT NULL,
  `arrived` tinyint(1) DEFAULT '0',
  `destination` varchar(255) DEFAULT NULL,
  `returned` tinyint(1) DEFAULT '0',
  `returned_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_admin_processor` (`processed_by`),
  CONSTRAINT `fk_admin_processor` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `visitor_requests_ibfk_1` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitor_requests`
--

LOCK TABLES `visitor_requests` WRITE;
/*!40000 ALTER TABLE `visitor_requests` DISABLE KEYS */;
INSERT INTO `visitor_requests` VALUES (29,'Kim','Jean Yap','yapkimjean@gmail.com','2026-05-20','18:38:00','Facility Tour','APPROVED',NULL,'2026-05-20 10:36:21',9,'2026-05-20 10:36:33','+639469738712',NULL,0,NULL,'2026-05-20 11:59:53',1,'Classroom 2',1,'2026-05-20 12:26:26'),(30,'Kim','Jean Yap','yapkimjean@gmail.com','2026-05-20','19:33:00','Facility Tour','APPROVED',NULL,'2026-05-20 11:32:41',9,'2026-05-20 11:33:04','+639469738712',NULL,0,NULL,'2026-05-20 11:57:33',1,'Classroom 1',1,'2026-05-20 14:53:11'),(31,'danzi','','danzi9012004@gmail.com','2026-05-20','20:02:00','Facility Tour','APPROVED',NULL,'2026-05-20 12:01:46',9,'2026-05-20 12:02:27','09169562991',NULL,0,NULL,'2026-05-20 12:28:10',1,'Classroom 2',1,'2026-05-20 12:49:38'),(32,'danzi','','danzi9012004@gmail.com','2026-05-20','20:51:00','Facility Tour','APPROVED',NULL,'2026-05-20 12:50:59',9,'2026-05-20 12:51:09','+639263909480',NULL,0,NULL,'2026-05-20 12:51:41',1,'Classroom 2',1,'2026-05-20 14:40:35'),(35,'danzzz','','daennylyn@gmail.com','2026-05-20','22:50:00','Facility Tour','APPROVED',NULL,'2026-05-20 14:48:58',9,'2026-05-20 14:49:18','+639263909480',NULL,0,NULL,'2026-05-20 14:52:32',1,'Classroom 2',1,'2026-05-20 15:21:24'),(36,'Kim','Jean Yap','yapkimjean@gmail.com','2026-05-20','23:25:00','Facility Tour','APPROVED',NULL,'2026-05-20 15:21:39',9,'2026-05-20 15:21:53','+639469738712',NULL,0,NULL,'2026-05-20 15:23:13',1,'Classroom 2',1,'2026-05-20 15:36:02'),(37,'Kim','Jean Yap','yapkimjean@gmail.com','2026-05-20','23:38:00','Facility Tour','APPROVED',NULL,'2026-05-20 15:36:24',9,'2026-05-20 15:36:35','+639469738712',NULL,0,NULL,'2026-05-20 15:37:04',1,'Classroom 2',1,'2026-05-20 16:03:27'),(38,'Kim','Jean Yap','yapkimjean@gmail.com','2026-05-21','00:05:00','Facility Tour','APPROVED',NULL,'2026-05-20 16:03:54',9,'2026-05-20 16:04:03','+639469738712',NULL,0,NULL,'2026-05-20 16:09:03',1,'Classroom 1',1,'2026-05-20 16:15:25'),(39,'danzz','','daennylyn@gmail.com','2026-05-21','00:16:00','Facility Tour','APPROVED',NULL,'2026-05-20 16:16:06',9,'2026-05-20 16:16:13','+639263909480',NULL,0,NULL,'2026-05-20 16:16:59',1,'Classroom 1',1,'2026-05-20 16:22:44'),(40,'Kim','Jean Yap','yapkimjean@gmail.com','2026-05-21','00:24:00','Facility Tour','APPROVED',NULL,'2026-05-20 16:23:06',9,'2026-05-20 16:23:15','+639469738712',NULL,0,NULL,'2026-05-20 16:24:12',1,'Classroom 1',1,'2026-05-21 07:52:09'),(41,'danzzz','','danzi9012004@gmail.com','2026-05-21','00:33:00','Facility Tour','APPROVED',NULL,'2026-05-20 16:32:53',9,'2026-05-20 16:33:01','+639469738712',NULL,0,NULL,'2026-05-20 16:33:37',1,'Classroom 1',1,'2026-05-21 07:52:10'),(42,'Kim','Jean Yap','yapkimjean@gmail.com','2026-05-21','16:01:00','Facility Tour','APPROVED',NULL,'2026-05-21 08:01:59',9,'2026-05-21 08:03:01','+639469738712','ESP32-Badge1',0,NULL,'2026-05-21 08:04:17',1,'Classroom 1',0,NULL),(43,'danzalan','','danzi9012004@gmail.com','2026-05-21','16:02:00','Facility Tour','APPROVED',NULL,'2026-05-21 08:02:22',9,'2026-05-21 08:03:05','+639263909480','ESP 32-Badge2',0,NULL,'2026-05-21 08:04:28',1,'Classroom 2',0,NULL);
/*!40000 ALTER TABLE `visitor_requests` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-25 18:10:15
