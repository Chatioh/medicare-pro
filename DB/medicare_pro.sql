-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 20, 2026 at 11:39 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `medicare_pro`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `appointment_number` varchar(255) NOT NULL,
  `patient_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `doctor_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `appointment_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('scheduled','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
  `type` enum('consultation','follow_up','emergency','routine_checkup') NOT NULL,
  `reason` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `appointment_number`, `patient_id`, `doctor_id`, `appointment_date`, `start_time`, `end_time`, `status`, `type`, `reason`, `notes`, `created_by`, `createdAt`, `updatedAt`) VALUES
('80d75c1b-c307-4f5a-9050-6f937351e1ce', 'APT-2026-0003', 'c595d34a-0479-4a04-9e80-d2764a2ec03b', '738f8b8d-cdfc-4862-ab3d-8678d19170b5', '2026-06-23', '21:30:00', '10:30:00', 'scheduled', 'follow_up', 'cvnmjknl;m\'lkvjh;mhm,j', NULL, '39c52dcf-a9b2-405e-9bd6-35d1897b42c4', '2026-06-09 14:28:23', '2026-06-10 19:09:34'),
('aeb9aae3-c278-4bd9-b28d-ecec7af268c7', 'APT-2026-0001', 'c595d34a-0479-4a04-9e80-d2764a2ec03b', '738f8b8d-cdfc-4862-ab3d-8678d19170b5', '2026-06-08', '11:56:00', '00:56:00', 'confirmed', 'emergency', 'uinuinuininiuniu', '', '39c52dcf-a9b2-405e-9bd6-35d1897b42c4', '2026-06-07 20:56:29', '2026-06-07 21:11:56'),
('bed53976-9e4e-4cd3-9602-6df56b6f194d', 'APT-2026-0004', 'c595d34a-0479-4a04-9e80-d2764a2ec03b', '738f8b8d-cdfc-4862-ab3d-8678d19170b5', '2026-06-09', '08:32:00', '09:32:00', 'cancelled', 'consultation', 'fgh jhkl', NULL, '39c52dcf-a9b2-405e-9bd6-35d1897b42c4', '2026-06-09 19:32:55', '2026-06-09 19:35:25'),
('ea9a3cee-6d38-41a6-89a7-514a527e3c2a', 'APT-2026-0002', 'c595d34a-0479-4a04-9e80-d2764a2ec03b', '738f8b8d-cdfc-4862-ab3d-8678d19170b5', '2026-06-09', '10:40:00', '11:40:00', 'cancelled', 'consultation', 'acawxaxw', NULL, '39c52dcf-a9b2-405e-9bd6-35d1897b42c4', '2026-06-07 21:41:04', '2026-06-09 19:35:09'),
('ed805eee-7f32-4356-b7f3-db594a998080', 'APT-2026-0005', '3116526f-a729-4ded-b8b0-a75b73016b88', '738f8b8d-cdfc-4862-ab3d-8678d19170b5', '2026-06-30', '11:30:00', '12:30:00', 'scheduled', 'routine_checkup', 'rdtfyuv;l\'kjoiuyfdtsrdtyfu', NULL, '39c52dcf-a9b2-405e-9bd6-35d1897b42c4', '2026-06-09 19:38:50', '2026-06-10 19:10:38'),
('f561e190-a78a-4611-997c-1aafa30c5221', 'APT-2026-0006', '3116526f-a729-4ded-b8b0-a75b73016b88', '738f8b8d-cdfc-4862-ab3d-8678d19170b5', '2026-06-30', '08:13:00', '10:13:00', 'scheduled', 'consultation', 'Test', NULL, '39c52dcf-a9b2-405e-9bd6-35d1897b42c4', '2026-06-10 19:13:42', '2026-06-10 19:13:42');

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `specialization` varchar(255) NOT NULL,
  `license_number` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `available_days` varchar(255) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `user_id`, `specialization`, `license_number`, `phone`, `bio`, `available_days`, `start_time`, `end_time`, `createdAt`) VALUES
('738f8b8d-cdfc-4862-ab3d-8678d19170b5', '1346d71f-1bcd-49d6-a7be-b41a0aa32417', 'General Practice', 'CM-MED-2025-001', '+237 677 111 222', 'Experienced general practitioner with 10 years of practice in Yaounde\n', 'Mon,Tue,Wed,Thu,Fri', '08:00:00', '17:00:00', '2026-06-07 19:36:08');

-- --------------------------------------------------------

--
-- Table structure for table `medical_histories`
--

CREATE TABLE `medical_histories` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `patient_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `chronic_conditions` text DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `past_surgeries` text DEFAULT NULL,
  `current_medications` text DEFAULT NULL,
  `family_history` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `medical_histories`
--

INSERT INTO `medical_histories` (`id`, `patient_id`, `chronic_conditions`, `allergies`, `past_surgeries`, `current_medications`, `family_history`, `notes`, `updatedAt`) VALUES
('8fc3eb37-ef07-4020-ac33-14bf410ac001', '3116526f-a729-4ded-b8b0-a75b73016b88', NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-07 18:02:00'),
('d5e80386-f85b-491d-a65a-cef3162c4604', 'c595d34a-0479-4a04-9e80-d2764a2ec03b', NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-07 18:47:05');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `patient_number` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `blood_group` varchar(255) DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `patient_number`, `full_name`, `date_of_birth`, `gender`, `phone`, `email`, `address`, `blood_group`, `emergency_contact_name`, `emergency_contact_phone`, `createdAt`, `updatedAt`) VALUES
('3116526f-a729-4ded-b8b0-a75b73016b88', 'PAT-2026-8015', 'John Doe', '1995-05-15', 'male', '+237 677 123 456', 'john.doe@email.com', 'Yaounde, Cameroon', 'O+', 'Jane Doe', '+237 677 654 321', '2026-06-07 18:02:00', '2026-06-07 18:02:00'),
('c595d34a-0479-4a04-9e80-d2764a2ec03b', 'PAT-2026-8348', 'Marie Nguema', '1985-03-22', 'female', '+237 699 456 789', 'marie.nguema@email.com', 'Bastos, Yaounde, Cameroon', 'A+', 'Paul Nguema', '+237 677 987 654', '2026-06-07 18:47:05', '2026-06-09 17:09:24');

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `prescription_number` varchar(255) NOT NULL,
  `patient_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `doctor_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `appointment_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `diagnosis` text NOT NULL,
  `status` enum('issued','dispensed','expired','cancelled') NOT NULL DEFAULT 'issued',
  `issued_at` datetime NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `prescriptions`
--

INSERT INTO `prescriptions` (`id`, `prescription_number`, `patient_id`, `doctor_id`, `appointment_id`, `diagnosis`, `status`, `issued_at`, `expires_at`, `notes`) VALUES
('20374c90-d049-4a19-b83b-c82efc1f64a3', 'RX-2026-0002', '3116526f-a729-4ded-b8b0-a75b73016b88', '738f8b8d-cdfc-4862-ab3d-8678d19170b5', NULL, 'Monkey Pox', 'cancelled', '2026-06-09 14:46:17', '2026-06-12 00:00:00', 'Always take your suplements'),
('f85c0c92-4d07-48d9-b4bf-94de8df24b76', 'RX-2026-0001', 'c595d34a-0479-4a04-9e80-d2764a2ec03b', '738f8b8d-cdfc-4862-ab3d-8678d19170b5', NULL, 'Monkey Pox', 'dispensed', '2026-06-09 11:50:15', '2026-06-10 00:00:00', 'dfgchvjknl');

-- --------------------------------------------------------

--
-- Table structure for table `prescription_items`
--

CREATE TABLE `prescription_items` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `prescription_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `medication_name` varchar(255) NOT NULL,
  `dosage` varchar(255) NOT NULL,
  `frequency` varchar(255) NOT NULL,
  `duration` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `instructions` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `prescription_items`
--

INSERT INTO `prescription_items` (`id`, `prescription_id`, `medication_name`, `dosage`, `frequency`, `duration`, `quantity`, `instructions`) VALUES
('bd967edf-abb8-458d-9d99-240b3ab3bd07', '20374c90-d049-4a19-b83b-c82efc1f64a3', 'Amoxillin', '500mg', '3x daily', '7 days', 13, 'After meals'),
('c6827c20-1049-438a-b0f1-b4bb08bf7605', 'f85c0c92-4d07-48d9-b4bf-94de8df24b76', 'sdfjkj', '567', '67', '7days', 16, 'sdfgjkl');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','doctor','nurse','receptionist') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `is_active`, `createdAt`, `updatedAt`) VALUES
('1346d71f-1bcd-49d6-a7be-b41a0aa32417', 'Dr. Emmanuel Fon', 'dr.fon@medicare.com', '$2a$12$GEzeCVyZ9Up0hsAI0fUjBebyIM1YtqSMf5L.Db83ZXpLhyV2qMava', 'doctor', 1, '2026-06-07 19:36:08', '2026-06-12 08:32:46'),
('2b3fc416-6dfe-466a-a239-c2dc54fc1353', 'Grace Atanga', 'grace.atanga@medicare.com', '$2a$12$HBkUSssM4dxHEGK1u428p.KoMujw/Myqxk4eBmxXz1erozRLAf4dK', 'nurse', 1, '2026-06-11 11:18:37', '2026-06-11 11:49:55'),
('39c52dcf-a9b2-405e-9bd6-35d1897b42c4', 'Admin User', 'admin@medicare.com', '$2a$12$rDMWlVjezZEzTn/0QbN3DOhc8m35TIIuXjBeSMjvOib2QFLAMj1yS', 'admin', 1, '2026-06-03 09:53:40', '2026-06-03 09:53:40'),
('a50668b5-f73d-4e40-8c51-880a9b00e596', 'Sophie Mbarga', 'sophie.mbarga@medicare.com', '$2a$12$q4P2watyQb15WAafVPMH/eMUlkDbUen.T.hRrTxIIFbe.6wAqa1Ri', 'receptionist', 1, '2026-06-11 11:16:51', '2026-06-11 11:44:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `appointment_number` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_2` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_3` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_4` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_5` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_6` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_7` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_8` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_9` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_10` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_11` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_12` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_13` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_14` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_15` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_16` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_17` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_18` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_19` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_20` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_21` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_22` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_23` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_24` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_25` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_26` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_27` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_28` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_29` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_30` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_31` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_32` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_33` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_34` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_35` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_36` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_37` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_38` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_39` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_40` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_41` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_42` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_43` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_44` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_45` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_46` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_47` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_48` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_49` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_50` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_51` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_52` (`appointment_number`),
  ADD UNIQUE KEY `appointment_number_53` (`appointment_number`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_number` (`license_number`),
  ADD UNIQUE KEY `license_number_2` (`license_number`),
  ADD UNIQUE KEY `license_number_3` (`license_number`),
  ADD UNIQUE KEY `license_number_4` (`license_number`),
  ADD UNIQUE KEY `license_number_5` (`license_number`),
  ADD UNIQUE KEY `license_number_6` (`license_number`),
  ADD UNIQUE KEY `license_number_7` (`license_number`),
  ADD UNIQUE KEY `license_number_8` (`license_number`),
  ADD UNIQUE KEY `license_number_9` (`license_number`),
  ADD UNIQUE KEY `license_number_10` (`license_number`),
  ADD UNIQUE KEY `license_number_11` (`license_number`),
  ADD UNIQUE KEY `license_number_12` (`license_number`),
  ADD UNIQUE KEY `license_number_13` (`license_number`),
  ADD UNIQUE KEY `license_number_14` (`license_number`),
  ADD UNIQUE KEY `license_number_15` (`license_number`),
  ADD UNIQUE KEY `license_number_16` (`license_number`),
  ADD UNIQUE KEY `license_number_17` (`license_number`),
  ADD UNIQUE KEY `license_number_18` (`license_number`),
  ADD UNIQUE KEY `license_number_19` (`license_number`),
  ADD UNIQUE KEY `license_number_20` (`license_number`),
  ADD UNIQUE KEY `license_number_21` (`license_number`),
  ADD UNIQUE KEY `license_number_22` (`license_number`),
  ADD UNIQUE KEY `license_number_23` (`license_number`),
  ADD UNIQUE KEY `license_number_24` (`license_number`),
  ADD UNIQUE KEY `license_number_25` (`license_number`),
  ADD UNIQUE KEY `license_number_26` (`license_number`),
  ADD UNIQUE KEY `license_number_27` (`license_number`),
  ADD UNIQUE KEY `license_number_28` (`license_number`),
  ADD UNIQUE KEY `license_number_29` (`license_number`),
  ADD UNIQUE KEY `license_number_30` (`license_number`),
  ADD UNIQUE KEY `license_number_31` (`license_number`),
  ADD UNIQUE KEY `license_number_32` (`license_number`),
  ADD UNIQUE KEY `license_number_33` (`license_number`),
  ADD UNIQUE KEY `license_number_34` (`license_number`),
  ADD UNIQUE KEY `license_number_35` (`license_number`),
  ADD UNIQUE KEY `license_number_36` (`license_number`),
  ADD UNIQUE KEY `license_number_37` (`license_number`),
  ADD UNIQUE KEY `license_number_38` (`license_number`),
  ADD UNIQUE KEY `license_number_39` (`license_number`),
  ADD UNIQUE KEY `license_number_40` (`license_number`),
  ADD UNIQUE KEY `license_number_41` (`license_number`),
  ADD UNIQUE KEY `license_number_42` (`license_number`),
  ADD UNIQUE KEY `license_number_43` (`license_number`),
  ADD UNIQUE KEY `license_number_44` (`license_number`),
  ADD UNIQUE KEY `license_number_45` (`license_number`),
  ADD UNIQUE KEY `license_number_46` (`license_number`),
  ADD UNIQUE KEY `license_number_47` (`license_number`),
  ADD UNIQUE KEY `license_number_48` (`license_number`),
  ADD UNIQUE KEY `license_number_49` (`license_number`),
  ADD UNIQUE KEY `license_number_50` (`license_number`),
  ADD UNIQUE KEY `license_number_51` (`license_number`),
  ADD UNIQUE KEY `license_number_52` (`license_number`),
  ADD UNIQUE KEY `license_number_53` (`license_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `medical_histories`
--
ALTER TABLE `medical_histories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patient_id` (`patient_id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patient_number` (`patient_number`),
  ADD UNIQUE KEY `patient_number_2` (`patient_number`),
  ADD UNIQUE KEY `patient_number_3` (`patient_number`),
  ADD UNIQUE KEY `patient_number_4` (`patient_number`),
  ADD UNIQUE KEY `patient_number_5` (`patient_number`),
  ADD UNIQUE KEY `patient_number_6` (`patient_number`),
  ADD UNIQUE KEY `patient_number_7` (`patient_number`),
  ADD UNIQUE KEY `patient_number_8` (`patient_number`),
  ADD UNIQUE KEY `patient_number_9` (`patient_number`),
  ADD UNIQUE KEY `patient_number_10` (`patient_number`),
  ADD UNIQUE KEY `patient_number_11` (`patient_number`),
  ADD UNIQUE KEY `patient_number_12` (`patient_number`),
  ADD UNIQUE KEY `patient_number_13` (`patient_number`),
  ADD UNIQUE KEY `patient_number_14` (`patient_number`),
  ADD UNIQUE KEY `patient_number_15` (`patient_number`),
  ADD UNIQUE KEY `patient_number_16` (`patient_number`),
  ADD UNIQUE KEY `patient_number_17` (`patient_number`),
  ADD UNIQUE KEY `patient_number_18` (`patient_number`),
  ADD UNIQUE KEY `patient_number_19` (`patient_number`),
  ADD UNIQUE KEY `patient_number_20` (`patient_number`),
  ADD UNIQUE KEY `patient_number_21` (`patient_number`),
  ADD UNIQUE KEY `patient_number_22` (`patient_number`),
  ADD UNIQUE KEY `patient_number_23` (`patient_number`),
  ADD UNIQUE KEY `patient_number_24` (`patient_number`),
  ADD UNIQUE KEY `patient_number_25` (`patient_number`),
  ADD UNIQUE KEY `patient_number_26` (`patient_number`),
  ADD UNIQUE KEY `patient_number_27` (`patient_number`),
  ADD UNIQUE KEY `patient_number_28` (`patient_number`),
  ADD UNIQUE KEY `patient_number_29` (`patient_number`),
  ADD UNIQUE KEY `patient_number_30` (`patient_number`),
  ADD UNIQUE KEY `patient_number_31` (`patient_number`),
  ADD UNIQUE KEY `patient_number_32` (`patient_number`),
  ADD UNIQUE KEY `patient_number_33` (`patient_number`),
  ADD UNIQUE KEY `patient_number_34` (`patient_number`),
  ADD UNIQUE KEY `patient_number_35` (`patient_number`),
  ADD UNIQUE KEY `patient_number_36` (`patient_number`),
  ADD UNIQUE KEY `patient_number_37` (`patient_number`),
  ADD UNIQUE KEY `patient_number_38` (`patient_number`),
  ADD UNIQUE KEY `patient_number_39` (`patient_number`),
  ADD UNIQUE KEY `patient_number_40` (`patient_number`),
  ADD UNIQUE KEY `patient_number_41` (`patient_number`),
  ADD UNIQUE KEY `patient_number_42` (`patient_number`),
  ADD UNIQUE KEY `patient_number_43` (`patient_number`),
  ADD UNIQUE KEY `patient_number_44` (`patient_number`),
  ADD UNIQUE KEY `patient_number_45` (`patient_number`),
  ADD UNIQUE KEY `patient_number_46` (`patient_number`),
  ADD UNIQUE KEY `patient_number_47` (`patient_number`),
  ADD UNIQUE KEY `patient_number_48` (`patient_number`),
  ADD UNIQUE KEY `patient_number_49` (`patient_number`),
  ADD UNIQUE KEY `patient_number_50` (`patient_number`),
  ADD UNIQUE KEY `patient_number_51` (`patient_number`),
  ADD UNIQUE KEY `patient_number_52` (`patient_number`),
  ADD UNIQUE KEY `patient_number_53` (`patient_number`);

--
-- Indexes for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `prescription_number` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_2` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_3` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_4` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_5` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_6` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_7` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_8` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_9` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_10` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_11` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_12` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_13` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_14` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_15` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_16` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_17` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_18` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_19` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_20` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_21` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_22` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_23` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_24` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_25` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_26` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_27` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_28` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_29` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_30` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_31` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_32` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_33` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_34` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_35` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_36` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_37` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_38` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_39` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_40` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_41` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_42` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_43` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_44` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_45` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_46` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_47` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_48` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_49` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_50` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_51` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_52` (`prescription_number`),
  ADD UNIQUE KEY `prescription_number_53` (`prescription_number`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`),
  ADD KEY `appointment_id` (`appointment_id`);

--
-- Indexes for table `prescription_items`
--
ALTER TABLE `prescription_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prescription_id` (`prescription_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`),
  ADD UNIQUE KEY `email_45` (`email`),
  ADD UNIQUE KEY `email_46` (`email`),
  ADD UNIQUE KEY `email_47` (`email`),
  ADD UNIQUE KEY `email_48` (`email`),
  ADD UNIQUE KEY `email_49` (`email`),
  ADD UNIQUE KEY `email_50` (`email`),
  ADD UNIQUE KEY `email_51` (`email`),
  ADD UNIQUE KEY `email_52` (`email`),
  ADD UNIQUE KEY `email_53` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_157` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_158` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_159` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `medical_histories`
--
ALTER TABLE `medical_histories`
  ADD CONSTRAINT `medical_histories_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD CONSTRAINT `prescriptions_ibfk_157` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `prescriptions_ibfk_158` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `prescriptions_ibfk_159` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `prescription_items`
--
ALTER TABLE `prescription_items`
  ADD CONSTRAINT `prescription_items_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
