/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.11-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: merit_list_system
-- ------------------------------------------------------
-- Server version	10.11.11-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cancelled_meritlist`
--

DROP TABLE IF EXISTS `cancelled_meritlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cancelled_meritlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cnic` varchar(20) NOT NULL,
  `program_id` int(11) NOT NULL,
  `program_short_name` varchar(50) DEFAULT NULL,
  `cancelled_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cancelled_meritlist`
--

LOCK TABLES `cancelled_meritlist` WRITE;
/*!40000 ALTER TABLE `cancelled_meritlist` DISABLE KEYS */;
INSERT INTO `cancelled_meritlist` VALUES
(1,'16101-8336893-2',1,'CSE-O','2025-06-02 13:24:26'),
(2,'16101-8336893-2',1,'CSE-O','2025-06-02 13:24:37'),
(3,'16101-4548937-7',1,'CSE-O','2025-06-02 13:28:52'),
(4,'16101-7654321-2',1,'CSE-O','2025-06-02 14:10:46');
/*!40000 ALTER TABLE `cancelled_meritlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `confirmed_seats`
--

DROP TABLE IF EXISTS `confirmed_seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `confirmed_seats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cnic` varchar(50) NOT NULL,
  `program_id` int(11) NOT NULL,
  `program_short_name` varchar(50) DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `confirmed_seats`
--

LOCK TABLES `confirmed_seats` WRITE;
/*!40000 ALTER TABLE `confirmed_seats` DISABLE KEYS */;
INSERT INTO `confirmed_seats` VALUES
(28,'16101-8336893-2',3,'CE-O','2025-06-14 16:50:24'),
(29,'16101-4548937-7',3,'CE-O','2025-06-14 16:50:29'),
(34,'17201-1234567-1',1,'CSE-O','2025-06-21 13:16:04');
/*!40000 ALTER TABLE `confirmed_seats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `seats_open` int(3) NOT NULL DEFAULT 20,
  `seats_self_finance` int(3) NOT NULL DEFAULT 10,
  `programType` enum('Engineering','Non-Engineering') NOT NULL DEFAULT 'Engineering',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES
(1,'computer science sas','computer science is the best department ever','2025-05-03 15:18:08','2025-05-03 16:49:27',20,10,'Engineering'),
(2,'software engineering','software engineering is also best department ever','2025-05-03 15:18:58','2025-05-03 15:18:58',20,10,'Engineering');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `merit_list`
--

DROP TABLE IF EXISTS `merit_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `merit_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `cnic` varchar(15) NOT NULL,
  `merit` decimal(5,2) NOT NULL,
  `rank` int(11) NOT NULL,
  `program_name` varchar(255) NOT NULL,
  `program_short_name` varchar(50) NOT NULL,
  `category` varchar(50) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `availed` tinyint(1) NOT NULL DEFAULT 0,
  `confirmed` tinyint(1) DEFAULT 0,
  `not_appeared` tinyint(1) DEFAULT 0,
  `lockseat` tinyint(1) DEFAULT 0,
  `unlockseat` tinyint(1) DEFAULT 0,
  `form_no` varchar(255) DEFAULT NULL,
  `matched_preference` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `merit_list_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2056 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `merit_list`
--

LOCK TABLES `merit_list` WRITE;
/*!40000 ALTER TABLE `merit_list` DISABLE KEYS */;
INSERT INTO `merit_list` VALUES
(428,5,'Ali Ahmed','16202-2807968-4',88.15,8,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(429,5,'Hina Bibi','16101-8336893-2',87.68,9,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(430,5,'Shahzaib Ali','16101-4548937-7',87.22,10,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(431,5,'Bilal Ahmed','13503-6543219-5',86.87,11,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(432,5,'Ahmed Khan','16102-8736528-9',86.22,12,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(433,5,'Tariq Javed','16106-7123456-7',85.91,13,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(434,5,'Zeeshan Khan','16203-4628092-7',85.81,14,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(435,5,'Usman Ali','15103-5962827-1',85.68,15,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(436,5,'Irfan Ali','15102-8394974-0',83.05,16,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(437,5,'Rabia Ali','16104-2298371-0',82.77,17,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(438,5,'Faisal Alam','15302-3819201-4',82.27,18,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(439,5,'Shahid Nawaz','16201-2573123-2',81.73,19,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(440,5,'Mariam Ahmad','16011-4237822-1',79.64,20,'Telecommunication Engineering','TE-O','open_merit',1,0,0,0,0,0,NULL,NULL),
(441,5,'Sarah Adeel','16105-8342091-1',79.55,21,'Telecommunication Engineering','TE-O','rational',1,0,0,0,0,0,NULL,NULL),
(1958,3,'Hina Bibi','16101-8336893-2',87.68,1,'Civil Engineering','CE-O','open_merit',2,0,1,0,1,0,'UETME-2024-1533',NULL),
(1959,3,'Shahzaib Ali','16101-4548937-7',87.22,2,'Civil Engineering','CE-O','open_merit',2,0,1,0,1,0,'UETME-2024-936',NULL),
(1960,3,'Bilal Ahmed','13503-6543219-5',86.87,3,'Civil Engineering','CE-O','open_merit',2,0,0,0,0,0,'UETME-2024-105',NULL),
(1961,3,'Sara Bibi','16101-7654321-2',86.80,4,'Civil Engineering','CE-O','open_merit',2,0,0,0,0,0,'UETME-2024-102',NULL),
(1962,3,'Muneeb Farooq','13503-5736368-2',86.55,5,'Civil Engineering','CE-O','open_merit',2,0,0,0,0,0,'UETME-2024-1455',NULL),
(1963,3,'Ahmed Khan','16102-8736528-9',86.22,6,'Civil Engineering','CE-O','open_merit',2,0,0,0,0,0,'UETME-2024-1123',NULL),
(1964,3,'Tariq Javed','16106-7123456-7',85.91,7,'Civil Engineering','CE-O','open_merit',2,0,0,0,0,0,'UETME-2024-3082',NULL),
(1965,3,'Zeeshan Khan','16203-4628092-7',85.81,8,'Civil Engineering','CE-O','open_merit',2,0,0,0,0,0,'UETME-2024-2450',NULL),
(1966,3,'Usman Ali','15103-5962827-1',85.68,9,'Civil Engineering','CE-O','open_merit',2,0,0,0,0,0,'UETME-2024-3451',NULL),
(1967,3,'Irfan Ali','15102-8394974-0',83.05,10,'Civil Engineering','CE-O','open_merit',2,0,0,0,0,0,'UETME-2024-4203',NULL),
(2042,1,'Hamza Noor','17201-2468135-7',93.64,1,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-107',2),
(2043,1,'Usman Ali','13101-7894561-3',93.00,2,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-103',2),
(2044,1,'Rehan Afridi','14201-9988776-9',91.55,3,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-109',1),
(2045,1,'Zara Shah','15101-1357924-6',91.32,4,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-106',1),
(2046,1,'Fatima Javed','16101-1122334-8',90.14,5,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-108',4),
(2047,1,'Ali Khan','17201-1234567-1',89.95,6,'Computer Science ','CSE-O','open_merit',1,0,1,0,1,0,'UETME-2024-101',1),
(2048,1,'Nida Zaman','13101-8877665-0',89.85,7,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-110',2),
(2049,1,'Ayesha Khan','16202-9876543-4',88.25,8,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-104',4),
(2050,1,'Ali Ahmed','16202-2807968-4',88.15,9,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-186',1),
(2051,1,'Sana Shah','16103-0623727-8',87.98,10,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-685',1),
(2052,1,'Hina Bibi','16101-8336893-2',87.68,1,'Computer Science ','CSE-R','rational',2,0,0,0,0,0,'UETME-2024-1533',6),
(2053,1,'Shahzaib Ali','16101-4548937-7',87.22,2,'Computer Science ','CSE-R','rational',2,0,0,0,0,0,'UETME-2024-936',6),
(2054,1,'Ahmed Khan','16102-8736528-9',86.22,3,'Computer Science ','CSE-R','rational',2,0,0,0,0,0,'UETME-2024-1123',6),
(2055,1,'Tariq Javed','16106-7123456-7',85.91,4,'Computer Science ','CSE-R','rational',2,0,0,0,0,0,'UETME-2024-3082',2);
/*!40000 ALTER TABLE `merit_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `merit_weights`
--

DROP TABLE IF EXISTS `merit_weights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `merit_weights` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_type` enum('engineering','non-engineering') NOT NULL,
  `ssc_weight` decimal(5,2) NOT NULL,
  `inter_weight` decimal(5,2) NOT NULL,
  `test_weight` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `merit_weights`
--

LOCK TABLES `merit_weights` WRITE;
/*!40000 ALTER TABLE `merit_weights` DISABLE KEYS */;
INSERT INTO `merit_weights` VALUES
(1,'engineering',20.00,30.00,50.00),
(2,'non-engineering',30.00,70.00,0.00);
/*!40000 ALTER TABLE `merit_weights` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `short_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `programType` enum('Engineering','Non-Engineering') NOT NULL DEFAULT 'Engineering',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES
(1,'Computer Science ','CSE-O','A program focusing on the fundamentals of computing, programming, and software development.','2025-05-03 18:08:18','2025-05-21 10:31:09','Engineering'),
(3,'Civil Engineering','CE-O','A program that focuses on the design and construction of infrastructure such as roads, bridges, and buildings.','2025-05-03 18:08:18','2025-05-04 04:47:23','Engineering'),
(4,'Electrical Engineering','EE-R','A program that covers the study of electrical systems, power generation, and electronics.','2025-05-03 18:08:18','2025-05-20 07:50:51','Engineering'),
(5,'Telecommunication Engineering','TE-O','A program focused on communication systems, including satellite, wireless, and optical communication.','2025-05-03 18:08:18','2025-05-04 09:46:46','Engineering'),
(6,'Software Engineering','SE','A program that prepares students to design and develop software applications for businesses and consumers.','2025-05-03 18:08:18','2025-05-03 18:08:18','Engineering'),
(7,'Environmental Engineering','EnvE','A program dedicated to solving environmental issues using engineering principles.','2025-05-03 18:08:18','2025-05-03 18:08:18','Engineering'),
(8,'Architecture','Arch','A program focused on the study of designing and planning buildings and other structures.','2025-05-03 18:08:18','2025-05-03 18:08:18','Non-Engineering'),
(9,'Civil Engineering Technology','CET','A technology program focusing on construction and management of infrastructure projects.','2025-05-03 18:08:18','2025-05-03 18:08:18','Engineering'),
(10,'Electrical Technology','ET','A technical program covering electrical installations, power generation, and industrial electrical systems.','2025-05-03 18:08:18','2025-05-03 18:08:18','Engineering'),
(11,'Business Administration','BA','A non-engineering program focusing on the management of businesses and organizations.','2025-05-03 18:08:18','2025-05-03 18:08:18','Non-Engineering'),
(12,'Fashion Design','FD','A program that focuses on the art and science of designing clothing and accessories.','2025-05-03 18:08:18','2025-05-03 18:08:18','Non-Engineering'),
(13,'Information Technology','IT','A program focusing on the use of computers and software in managing and processing information.','2025-05-03 18:08:18','2025-05-03 18:08:18','Non-Engineering'),
(14,'Biomedical Engineering','BME','A program that combines biological science and engineering to improve healthcare systems and technologies.','2025-05-03 18:08:18','2025-05-03 18:08:18','Engineering'),
(15,'Mechanical Technology','MT','A program that prepares students to work in mechanical engineering technology, focusing on machine tools, manufacturing, and systems.','2025-05-03 18:08:18','2025-05-03 18:08:18','Engineering'),
(16,'Chemical Engineering','ChemE','A program that deals with the process of converting raw materials into valuable products using chemical processes.','2025-05-03 18:08:18','2025-05-03 18:08:18','Engineering');
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_applications`
--

DROP TABLE IF EXISTS `student_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `form_no` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `domicile` varchar(50) DEFAULT NULL,
  `cnic` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mobile_no` varchar(20) DEFAULT NULL,
  `landline_no` varchar(20) DEFAULT NULL,
  `postal_address` varchar(255) DEFAULT NULL,
  `permanent_address` varchar(255) DEFAULT NULL,
  `current_student` enum('yes','no') DEFAULT NULL,
  `hifz_e_quran` enum('yes','no') DEFAULT NULL,
  `hifz_marks` int(11) DEFAULT 0,
  `emp_quota` enum('yes','no') DEFAULT NULL,
  `fata` enum('yes','no') DEFAULT NULL,
  `overseas` enum('yes','no') DEFAULT NULL,
  `ssc_obtain` int(11) DEFAULT NULL,
  `ssc_total` int(11) DEFAULT NULL,
  `intermediate_type` varchar(50) DEFAULT NULL,
  `intermediate_group` varchar(50) DEFAULT NULL,
  `intermediate_obtain` int(11) DEFAULT NULL,
  `intermediate_total` int(11) DEFAULT NULL,
  `etea_rollno` varchar(20) DEFAULT NULL,
  `etea_obtain` int(11) DEFAULT NULL,
  `etea_total` int(11) DEFAULT NULL,
  `aggregate` decimal(5,2) DEFAULT NULL,
  `preference_1` varchar(20) DEFAULT NULL,
  `preference_2` varchar(20) DEFAULT NULL,
  `preference_3` varchar(20) DEFAULT NULL,
  `preference_4` varchar(20) DEFAULT NULL,
  `preference_5` varchar(20) DEFAULT NULL,
  `preference_6` varchar(20) DEFAULT NULL,
  `preference_7` varchar(20) DEFAULT NULL,
  `preference_8` varchar(20) DEFAULT NULL,
  `preference_9` varchar(20) DEFAULT NULL,
  `preference_10` varchar(20) DEFAULT NULL,
  `selected_for_meritlist` tinyint(4) DEFAULT 0,
  `selected_program_shortname` varchar(50) DEFAULT NULL,
  `preference_11` varchar(20) DEFAULT NULL,
  `preference_12` varchar(20) DEFAULT NULL,
  `preference_13` varchar(20) DEFAULT NULL,
  `preference_14` varchar(20) DEFAULT NULL,
  `preference_15` varchar(20) DEFAULT NULL,
  `preference_16` varchar(20) DEFAULT NULL,
  `preference_17` varchar(20) DEFAULT NULL,
  `preference_18` varchar(20) DEFAULT NULL,
  `preference_19` varchar(20) DEFAULT NULL,
  `preference_20` varchar(20) DEFAULT NULL,
  `preference_21` varchar(20) DEFAULT NULL,
  `preference_22` varchar(20) DEFAULT NULL,
  `preference_23` varchar(20) DEFAULT NULL,
  `preference_24` varchar(20) DEFAULT NULL,
  `preference_25` varchar(20) DEFAULT NULL,
  `preference_26` varchar(20) DEFAULT NULL,
  `preference_27` varchar(20) DEFAULT NULL,
  `preference_28` varchar(20) DEFAULT NULL,
  `preference_29` varchar(20) DEFAULT NULL,
  `preference_30` varchar(20) DEFAULT NULL,
  `preference_31` varchar(20) DEFAULT NULL,
  `preference_32` varchar(20) DEFAULT NULL,
  `preference_33` varchar(20) DEFAULT NULL,
  `preference_34` varchar(20) DEFAULT NULL,
  `preference_35` varchar(20) DEFAULT NULL,
  `preference_36` varchar(20) DEFAULT NULL,
  `preference_37` varchar(20) DEFAULT NULL,
  `preference_38` varchar(20) DEFAULT NULL,
  `preference_39` varchar(20) DEFAULT NULL,
  `preference_40` varchar(20) DEFAULT NULL,
  `preference_41` varchar(20) DEFAULT NULL,
  `preference_42` varchar(20) DEFAULT NULL,
  `preference_43` varchar(20) DEFAULT NULL,
  `preference_44` varchar(20) DEFAULT NULL,
  `preference_45` varchar(20) DEFAULT NULL,
  `preference_46` varchar(20) DEFAULT NULL,
  `preference_47` varchar(20) DEFAULT NULL,
  `preference_48` varchar(20) DEFAULT NULL,
  `preference_49` varchar(20) DEFAULT NULL,
  `preference_50` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_applications`
--

LOCK TABLES `student_applications` WRITE;
/*!40000 ALTER TABLE `student_applications` DISABLE KEYS */;
INSERT INTO `student_applications` VALUES
(1,'UETME-2024-101','Ali Khan','Rehmat Khan','2004-03-15','PESHAWAR','17201-1234567-1','ali.khan@gmail.com','03123456789',NULL,'House 12, Peshawar','Village Peshawar','no','no',0,'no','no','no',1020,1100,'Intermediate','Pre-Engineering',530,550,'5001',85,100,90.12,'CSE-O','CE-O','EE-O','ME-O','TE-O','-','-','-','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(2,'UETME-2024-102','Sara Bibi','Akram Bibi','2005-07-25','MARDAN','16101-7654321-2','sara.bibi@gmail.com','03451234567',NULL,'Street 5, Mardan','Street 5, Mardan','no','yes',20,'no','no','no',1044,1100,'Intermediate','Pre-Medical',510,550,'5002',80,100,88.45,'CE-O','CSE-O','EE-O','ME-O','-','-','-','-','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(3,'UETME-2024-103','Usman Ali','Farooq Ali','2003-11-30','ABBOTTABAD','13101-7894561-3','usman.ali@gmail.com','03331234567',NULL,'Colony 3, Abbottabad','Village Abbottabad','no','no',0,'no','no','no',1060,1100,'Intermediate','Pre-Engineering',545,550,'5003',88,100,92.34,'EE-O','CSE-O','CE-O','-','-','-','-','-','-','-',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(4,'UETME-2024-104','Ayesha Khan','Hameed Khan','2004-02-20','SWABI','16202-9876543-4','ayesha.khan@gmail.com','03011223344',NULL,'Town 8, Swabi','Village Swabi','no','no',0,'no','no','no',1039,1100,'Intermediate','Pre-Medical',520,550,'5004',82,100,89.55,'ME-O','TE-O','CE-O','CSE-O','-','-','-','-','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(5,'UETME-2024-105','Bilal Ahmed','Aslam Ahmed','2004-08-10','MANSEHRA','13503-6543219-5','bilal.ahmed@gmail.com','03456789123',NULL,'Sector 2, Mansehra','Village Mansehra','no','no',0,'yes','no','no',1043,1100,'Intermediate','Pre-Medical',530,550,'5005',78,100,87.78,'TE-O','CSE-O','EE-O','CE-O','ME-O','-','-','-','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(6,'UETME-2024-106','Zara Shah','Noman Shah','2005-09-05','CHARSADDA','15101-1357924-6','zara.shah@gmail.com','03034567891',NULL,'Block 4, Charsadda','Village Charsadda','no','yes',20,'no','no','no',1065,1100,'Intermediate','Pre-Medical',540,550,'5006',85,100,91.15,'CSE-O','EE-O','CE-O','ME-O','TE-O','-','-','-','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(7,'UETME-2024-107','Hamza Noor','Iqbal Noor','2003-05-18','PESHAWAR','17201-2468135-7','hamza.noor@gmail.com','03123456780',NULL,'Ring Road, Peshawar','Village Peshawar','yes','no',0,'no','no','no',1025,1100,'Intermediate','Pre-Engineering',550,550,'5007',90,100,93.50,'EE-O','CSE-O','CE-O','ME-O','TE-O','-','-','-','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(8,'UETME-2024-108','Fatima Javed','Javed Iqbal','2005-12-12','MARDAN','16101-1122334-8','fatima.javed@gmail.com','03451122334',NULL,'Township, Mardan','Village Mardan','no','no',0,'no','yes','no',1070,1100,'Intermediate','Pre-Medical',535,550,'5008',83,100,90.00,'ME-O','TE-O','CE-O','CSE-O','-','-','-','-','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(9,'UETME-2024-109','Rehan Afridi','Sher Afridi','2004-01-01','KOHAT','14201-9988776-9','rehan.afridi@gmail.com','03121234567',NULL,'Area 7, Kohat','Village Kohat','no','no',0,'no','yes','no',1050,1100,'Intermediate','Pre-Engineering',540,550,'5009',86,100,91.60,'CSE-O','EE-O','CE-O','ME-O','TE-O','-','-','-','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(10,'UETME-2024-110','Nida Zaman','Zaman Khan','2004-10-18','ABBOTTABAD','13101-8877665-0','nida.zaman@gmail.com','03335556677',NULL,'Street 10, Abbottabad','Village Abbottabad','no','yes',20,'no','no','no',1048,1100,'Intermediate','Pre-Medical',528,550,'5010',84,100,89.80,'CE-O','CSE-O','EE-O','ME-O','TE-O','-','-','-','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(11,'UETME-2024-186','Ali Ahmed','Ibrahim Ahmed','2004-11-15','SWABI','16202-2807968-4','ali.ahmed@example.com','90078601',NULL,'Main Street, SWABI','123 SWABI, Peshawar','no','no',0,'no','no','no',1039,1100,'Intermediate','Pre-Medical',518,550,'62011',82,100,89.34,'CSE-O','CE-O','EE-O','ME-O','TE-O','-','-','-','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(12,'UETME-2024-685','Sana Shah','Rashid Shah','2005-11-10','MARDAN','16103-0623727-8','sana.shah@example.com','90078602','90078602','Apartment 5, Mardan','5 Park Road, Mardan','no','no',0,'no','no','no',1044,1100,'Intermediate','Pre-Engineering',560,600,'3051',82,100,88.96,'CSE-O','ME-O','CE-O','EE-O','CSE-R','EE-R','ME-R','CE-R','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(13,'UETME-2024-1455','Muneeb Farooq','Mohammad Farooq','2004-06-25','MANSEHRA','13503-5736368-2','muneeb.farooq@example.com','90078603',NULL,'House 23, Mansehra','Karak Road, Mansehra','no','no',0,'no','no','no',1043,1100,'Intermediate','Pre-Medical',534,550,'27011',50,65,88.80,'CSE-O','CE-O','ME-O','EE-O','-','-','-','-','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(14,'UETME-2024-1533','Hina Bibi','Zahid Bibi','2005-04-15','MARDAN','16101-8336893-2','hina.bibi@example.com','90078604',NULL,'Street 2, Mardan','Street 11, Mardan','no','no',0,'no','no','no',1068,1100,'Intermediate','Pre-Medical',504,550,'24021',53,65,88.14,'CSE-O','TE-O','EE-O','CE-O','ME-O','CSE-R','TE-R','EE-R','CE-R','ME-R',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(15,'UETME-2024-936','Shahzaib Ali','Saeed Ali','2005-06-29','MARDAN','16101-4548937-7','shahzaib.ali@example.com','90078605',NULL,'Street 12, Mardan','Mardan, Pakistan','no','no',0,'no','no','no',1092,1100,'Intermediate','Pre-Engineering',520,550,'36011',78,100,87.65,'CE-O','CSE-O','EE-O','ME-O','TE-O','CSE-R','ME-R','EE-R','-','-',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(16,'UETME-2024-1123','Ahmed Khan','Javed Khan','2004-01-12','PESHAWAR','16102-8736528-9','ahmed.khan@example.com','90078606',NULL,'House 33, Peshawar','Peshawar, Pakistan','no','no',0,'no','no','no',1012,1100,'Intermediate','Computer Science',510,550,'39011',80,100,88.10,'CSE-O','EE-O','ME-O','TE-O','CE-O','CSE-R','EE-R','ME-R','TE-R','CE-R',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(17,'UETME-2024-1789','Rabia Ali','Ghulam Ali','2005-07-19','CHARSADDA','16104-2298371-0','rabia.ali@example.com','90078607',NULL,'Street 5, Charsadda','Charsadda, KPK','no','no',0,'no','no','no',1005,1100,'Intermediate','Pre-Engineering',495,550,'21051',75,100,85.25,'ME-O','CE-O','EE-O','CSE-O','TE-O','ME-R','CE-R','EE-R','CSE-R','TE-R',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(18,'UETME-2024-2001','Faisal Alam','Nadeem Alam','2004-03-08','SWAT','15302-3819201-4','faisal.alam@example.com','90078608',NULL,'Street 8, Swat','Swat City','no','no',0,'no','no','no',990,1100,'Intermediate','Pre-Engineering',500,550,'29031',74,100,85.00,'EE-O','CSE-O','CE-O','ME-O','TE-O','EE-R','CSE-R','CE-R','ME-R','TE-R',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(19,'UETME-2024-2215','Sarah Adeel','Rashid Adeel','2005-05-05','DIR','16105-8342091-1','sarah.adeel@example.com','90078609',NULL,'House 45, Dir','Dir City, KPK','no','no',0,'no','no','no',980,1100,'Intermediate','Pre-Engineering',490,550,'31021',70,100,83.75,'CE-O','ME-O','CSE-O','EE-O','TE-O','CE-R','ME-R','CSE-R','EE-R','TE-R',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(20,'UETME-2024-2450','Zeeshan Khan','Shahbaz Khan','2004-12-30','MALAKAND','16203-4628092-7','zeeshan.khan@example.com','90078610',NULL,'Street 10, Malakand','Malakand City','no','no',0,'no','no','no',1002,1100,'Intermediate','Pre-Engineering',515,550,'33011',79,100,86.89,'CSE-O','EE-O','ME-O','CE-O','TE-O','CSE-R','EE-R','ME-R','CE-R','TE-R',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(21,'UETME-2024-3082','Tariq Javed','Iqbal Javed','2005-08-21','ABBOTTABAD','16106-7123456-7','tariq.javed@example.com','90078611',NULL,'Abbottabad Road, Abbottabad','Abbottabad','no','no',0,'no','no','no',1045,1100,'Intermediate','Pre-Medical',530,550,'22031',76,100,87.20,'CSE-O','CSE-R','EE-O','ME-O','CE-O','TE-O','ME-R','EE-R','CSE-R','TE-R',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(22,'UETME-2024-3451','Usman Ali','Muhammad Ali','2004-04-05','SWAT','15103-5962827-1','usman.ali@example.com','90078612',NULL,'Street 9, Swat','Swat City','no','no',0,'no','no','no',1050,1100,'Intermediate','Pre-Engineering',515,550,'34021',77,100,87.75,'EE-O','ME-O','CSE-O','CE-O','TE-O','EE-R','ME-R','CSE-R','CE-R','TE-R',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(23,'UETME-2024-3590','Mariam Ahmad','Sajid Ahmad','2004-10-14','PESHAWAR','16011-4237822-1','mariam.ahmad@example.com','90078613',NULL,'Peshawar Road, Peshawar','Peshawar','no','no',0,'no','no','no',990,1100,'Intermediate','Pre-Medical',470,550,'29041',72,100,83.60,'CSE-O','ME-O','CE-O','EE-O','TE-O','CSE-R','EE-R','ME-R','CE-R','TE-R',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(24,'UETME-2024-3874','Shahid Nawaz','Jameel Nawaz','2005-01-10','MARDAN','16201-2573123-2','shahid.nawaz@example.com','90078614',NULL,'Mardan Street, Mardan','Mardan, KPK','no','no',0,'no','no','no',1020,1100,'Intermediate','Pre-Engineering',480,550,'36031',74,100,85.90,'CSE-O','ME-O','CE-O','EE-O','TE-O','CSE-R','ME-R','EE-R','CE-R','TE-R',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(25,'UETME-2024-4203','Irfan Ali','Maqbool Ali','2004-09-11','CHARSADDA','15102-8394974-0','irfan.ali@example.com','90078615',NULL,'Charsadda, KPK','Charsadda','no','no',0,'no','no','no',1035,1100,'Intermediate','Pre-Engineering',490,550,'37021',75,100,85.00,'ME-O','CE-O','CSE-O','EE-O','TE-O','ME-R','CE-R','CSE-R','EE-R','TE-R',1,'ME-O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `student_applications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-22 15:56:34
