package com.appoutlet.api.service.synchronization

import com.appoutlet.api.model.ApplicationPackageType
import com.appoutlet.api.model.ApplicationStore
import com.appoutlet.api.model.appoutlet.AppOutletApplication
import com.appoutlet.api.model.snapstore.SnapStoreApplication
import com.appoutlet.api.repository.appoutlet.ApplicationRepository
import com.appoutlet.api.repository.snapstore.SnapStoreRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import reactor.kotlin.core.publisher.toMono

@Service
class SnapStoreSynchronizer(
    private val snapStoreRepository: SnapStoreRepository,
    private val applicationRepository: ApplicationRepository,
    private val synchronizationProperties: SynchronizationProperties
) : Synchronizer {
	private val logger = LoggerFactory.getLogger(SnapStoreSynchronizer::class.java)

	init {
	    if (!synchronizationProperties.snapStore.enabled) {
			logger.warn("Synchronization disabled for snap store")
		}
	}

	override fun synchronize(): Mono<Boolean> {
		return if (synchronizationProperties.snapStore.enabled) {
			startSynchronization()
		} else {
			Mono.just(false)
		}
	}

	private fun startSynchronization() = snapStoreRepository.getApps()
		.map(this::convertSnapStoreApplicationToAppOutletApplication)
		.flatMap(this::saveApplication)
		.buffer()
		.map { true }
		.toMono()

	private fun saveApplication(appOutletApplication: AppOutletApplication): Mono<AppOutletApplication> {
		return applicationRepository.save(appOutletApplication)
	}

	private fun convertSnapStoreApplicationToAppOutletApplication(
	    snapStoreApplication: SnapStoreApplication
	): AppOutletApplication {
		return AppOutletApplication(
			id = snapStoreApplication.snap_id,
			name = snapStoreApplication.name,
			summary = snapStoreApplication.summary,
			description = snapStoreApplication.description,
			developer = snapStoreApplication.developer_name,
			license = snapStoreApplication.license,
			homepage = snapStoreApplication.website,
			bugtrackerUrl = snapStoreApplication.support_url,
			donationUrl = null,
			icon = snapStoreApplication.icon_url,
			downloadUrl = snapStoreApplication.download_url,
			version = snapStoreApplication.version,
			lastReleaseDate = snapStoreApplication.last_updated,
			creationDate = snapStoreApplication.date_published,
			tags = null,
			screenshots = snapStoreApplication.screenshot_urls,
			store = ApplicationStore.SNAP_STORE,
			packageType = ApplicationPackageType.SNAP,
			packageName = snapStoreApplication.package_name,
			confinement = snapStoreApplication.confinement
		)
	}
}
