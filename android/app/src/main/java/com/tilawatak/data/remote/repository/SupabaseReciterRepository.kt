package com.tilawatak.data.remote.repository

import com.tilawatak.data.mock.MockData
import com.tilawatak.data.remote.SupabaseContracts
import com.tilawatak.data.remote.dto.SupabaseDtoMappers
import com.tilawatak.data.remote.http.SupabaseHttpClient
import com.tilawatak.domain.model.Reciter
import com.tilawatak.domain.repository.IReciterRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

class SupabaseReciterRepository(
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
) : IReciterRepository {

    private val _recitersFlow = MutableStateFlow<List<Reciter>>(MockData.RECITERS)

    init {
        refreshReciters()
    }

    fun refreshReciters() {
        scope.launch {
            val result = fetchPublicReciters()
            result.onSuccess { list ->
                if (list.isNotEmpty()) {
                    _recitersFlow.value = list
                }
            }
        }
    }

    override fun getRecitersStream(): Flow<List<Reciter>> {
        return _recitersFlow.asStateFlow()
    }

    private suspend fun fetchPublicReciters(params: Map<String, String> = emptyMap()): Result<List<Reciter>> {
        val queryParams = mutableMapOf(
            "select" to "*",
            "order" to "created_at.desc"
        ).apply { putAll(params) }

        val response = SupabaseHttpClient.get(SupabaseContracts.VIEW_PUBLIC_RECITERS, queryParams)
        return response.mapCatching { jsonStr ->
            val jsonArray = JSONArray(jsonStr)
            val list = mutableListOf<Reciter>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                list.add(SupabaseDtoMappers.mapJsonToReciter(obj))
            }
            list
        }.recoverCatching {
            // Fallback gracefully to memory state or mock data if network offline
            _recitersFlow.value
        }
    }

    override suspend fun getReciterById(id: String): Result<Reciter?> {
        val queryParams = mapOf(
            "select" to "*",
            "id" to "eq.$id",
            "limit" to "1"
        )
        val response = SupabaseHttpClient.get(SupabaseContracts.VIEW_PUBLIC_RECITERS, queryParams)
        return response.mapCatching { jsonStr ->
            val jsonArray = JSONArray(jsonStr)
            if (jsonArray.length() > 0) {
                SupabaseDtoMappers.mapJsonToReciter(jsonArray.getJSONObject(0))
            } else {
                _recitersFlow.value.find { it.id == id }
            }
        }.recoverCatching {
            _recitersFlow.value.find { it.id == id }
        }
    }

    override suspend fun getFeaturedReciters(): Result<List<Reciter>> {
        val queryParams = mapOf(
            "select" to "*",
            "or" to "(is_staff_pick.eq.true,is_verified.eq.true)",
            "limit" to "10"
        )
        val response = SupabaseHttpClient.get(SupabaseContracts.VIEW_PUBLIC_RECITERS, queryParams)
        return response.mapCatching { jsonStr ->
            val jsonArray = JSONArray(jsonStr)
            val list = mutableListOf<Reciter>()
            for (i in 0 until jsonArray.length()) {
                list.add(SupabaseDtoMappers.mapJsonToReciter(jsonArray.getJSONObject(i)))
            }
            if (list.isNotEmpty()) list else _recitersFlow.value.filter { it.isStaffPick || it.verified }
        }.recoverCatching {
            _recitersFlow.value.filter { it.isStaffPick || it.verified }
        }
    }

    override suspend fun searchReciters(query: String): Result<List<Reciter>> {
        val trimmed = query.trim()
        if (trimmed.isEmpty()) return Result.success(_recitersFlow.value)

        val rpcBody = JSONObject().apply {
            put("search_term", trimmed)
        }
        val response = SupabaseHttpClient.rpc(SupabaseContracts.RPC_SEARCH_RECITERS, rpcBody)
        return response.mapCatching { jsonStr ->
            val jsonArray = JSONArray(jsonStr)
            val list = mutableListOf<Reciter>()
            for (i in 0 until jsonArray.length()) {
                list.add(SupabaseDtoMappers.mapJsonToReciter(jsonArray.getJSONObject(i)))
            }
            list
        }.recoverCatching {
            // Local fallback filter
            val q = trimmed.lowercase()
            _recitersFlow.value.filter {
                it.displayName.lowercase().contains(q) ||
                        (it.pseudonym?.lowercase()?.contains(q) == true) ||
                        it.country.lowercase().contains(q)
            }
        }
    }

    override suspend fun getNewestReciters(limit: Int): Result<List<Reciter>> {
        val queryParams = mapOf(
            "select" to "*",
            "order" to "created_at.desc",
            "limit" to limit.toString()
        )
        val response = SupabaseHttpClient.get(SupabaseContracts.VIEW_PUBLIC_RECITERS, queryParams)
        return response.mapCatching { jsonStr ->
            val jsonArray = JSONArray(jsonStr)
            val list = mutableListOf<Reciter>()
            for (i in 0 until jsonArray.length()) {
                list.add(SupabaseDtoMappers.mapJsonToReciter(jsonArray.getJSONObject(i)))
            }
            if (list.isNotEmpty()) list else _recitersFlow.value.sortedByDescending { it.createdAtEpochMs }.take(limit)
        }.recoverCatching {
            _recitersFlow.value.sortedByDescending { it.createdAtEpochMs }.take(limit)
        }
    }
}
