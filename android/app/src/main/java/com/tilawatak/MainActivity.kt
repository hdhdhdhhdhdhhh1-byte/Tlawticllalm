package com.tilawatak

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.tilawatak.audio.MockAudioPlayerService
import com.tilawatak.data.local.DefaultAnonymousInstallationIdProvider
import com.tilawatak.data.repository.MockAdminNotificationRepository
import com.tilawatak.data.repository.MockRecitationRepository
import com.tilawatak.data.repository.MockReciterRepository
import com.tilawatak.data.repository.MockStatisticsRepository
import com.tilawatak.data.repository.MockSubmissionRepository
import com.tilawatak.ui.TilawatakApp

class MainActivity : ComponentActivity() {

    // Clean Architecture Repositories & Local Providers
    private val installationIdProvider by lazy { DefaultAnonymousInstallationIdProvider() }
    private val adminNotificationRepository by lazy { MockAdminNotificationRepository() }
    private val reciterRepository by lazy { MockReciterRepository() }
    private val recitationRepository by lazy { MockRecitationRepository() }
    private val statisticsRepository by lazy {
        MockStatisticsRepository(recitationRepository, reciterRepository)
    }
    private val submissionRepository by lazy {
        MockSubmissionRepository(adminNotificationRepository)
    }
    private val audioPlayerService by lazy {
        MockAudioPlayerService(recitationRepository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TilawatakApp(
                reciterRepository = reciterRepository,
                recitationRepository = recitationRepository,
                statisticsRepository = statisticsRepository,
                submissionRepository = submissionRepository,
                audioPlayerService = audioPlayerService,
                installationIdProvider = installationIdProvider
            )
        }
    }
}
