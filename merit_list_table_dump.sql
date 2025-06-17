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
) ENGINE=InnoDB AUTO_INCREMENT=2052 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
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
(2047,1,'Ali Khan','17201-1234567-1',89.95,6,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-101',1),
(2048,1,'Nida Zaman','13101-8877665-0',89.85,7,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-110',2),
(2049,1,'Ayesha Khan','16202-9876543-4',88.25,8,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-104',4),
(2050,1,'Ali Ahmed','16202-2807968-4',88.15,9,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-186',1),
(2051,1,'Sana Shah','16103-0623727-8',87.98,10,'Computer Science ','CSE-O','open_merit',1,0,0,0,0,0,'UETME-2024-685',1);
/*!40000 ALTER TABLE `merit_list` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-17 12:31:52
