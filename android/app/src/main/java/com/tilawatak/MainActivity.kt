package com.tilawatak

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.tilawatak.audio.MockAudioPlayerService
import com.tilawatak.data.RepositoryProvider
import com.tilawatak.data.local.DefaultAnonymousInstallationIdProvider
import com.tilawatak.data.remote.DataSourceMode
import com.tilawatak.data.remote.SupabaseConfig
import com.tilawatak.ui.TilawatakApp

class MainActivity : ComponentActivity() {

    // Clean Architecture Repositories & Local Providers
    private val installationIdProvider by lazy { DefaultAnonymousInstallationIdProvider() }
    private val repositoryProvider by lazy {
        RepositoryProvider(
            mode = SupabaseConfig.currentMode,
            installationIdProvider = installationIdProvider
        )
    }

    private val audioPlayerService by lazy {
        MockAudioPlayerService(repositoryProvider.recitationRepository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TilawatakApp(
                reciterRepository = repositoryProvider.reciterRepository,
                recitationRepository = repositoryProvider.recitationRepository,
                statisticsRepository = repositoryProvider.statisticsRepository,
                submissionRepository = repositoryProvider.submissionRepository,
                audioPlayerService = audioPlayerService,
                installationIdProvider = installationIdProvider
            )
        }
    }
}
