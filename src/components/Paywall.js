import React, { useRef, useLayoutEffect } from "react"
import { useAuth } from "react-use-auth"
import { Box } from "theme-ui"

import { default as PaywallCopy } from "../components/paywall-copy"
import QuickThanks from "./quickthanks"
import { useLocalStorage } from "./useLocalStorage"

function toggleLockedContent(show) {
  if (typeof window !== "undefined") {
    let children = document.getElementById("content").children

    let isLocked = false
    for (let child of children) {
      if (child.id === "lock") isLocked = true
      if (isLocked === true) {
        child.style.display = show ? "block" : "none"
      }
    }
  }
}

function hidePaywall(paywallDiv) {
  if (paywallDiv.current) {
    paywallDiv.current.style = `display: none`
  }

  const overlays =
    typeof window !== "undefined" &&
    document.querySelectorAll(".fadeout-overlay")

  if (overlays) {
    for (let overlay of overlays) {
      overlay.style = "display: none"
    }
  }

  // show content
  toggleLockedContent(true)
}

function showPaywall(paywallDiv) {
  // hide content
  toggleLockedContent(false)

  const overlay = typeof window !== "undefined" && document.createElement("div")
  const main =
    typeof window !== "undefined" && document.querySelector("main#content")

  const style = `
            background-image: linear-gradient(rgba(255, 255, 255, 0) 60%,  rgb(255, 255, 255, 1) 100%);
            width: 100%;
            top: 0px;
            bottom: 0px;
            position: absolute;
          `
  overlay.style = style
  overlay.className = "fadeout-overlay"

  main.style = "position: relative;"
  main.appendChild(overlay)

  const dimensions = main.getBoundingClientRect()

  if (paywallDiv.current) {
    paywallDiv.current.style = `
            top: ${Math.round(dimensions.height * 0.2)}px;
            width: ${Math.round(dimensions.width)}px;
            background-color: var(--theme-ui-colors-muted,#f6f6ff);
          `
  }
}

export function usePaywall(page) {
  const paywallDiv = useRef(null)
  const { isAuthorized } = useAuth()
  const [unlockHandbook] = useLocalStorage("unlock_handbook")
  const [saleId] = useLocalStorage("sale_id")
  const [unlockedPages, setUnlockedPages] = useLocalStorage(
    "unlocked_pages",
    []
  )
  const hasLock =
    typeof window !== "undefined" && document.querySelector("#lock")

  const unlocked =
    !hasLock ||
    (page && unlockedPages.includes(page)) ||
    isAuthorized(["ServerlessHandbook"]) ||
    (unlockHandbook && saleId)

  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        if (unlocked) {
          hidePaywall(paywallDiv)
        } else {
          showPaywall(paywallDiv)
        }
      })
    }
  }, [unlocked])

  function unlockCurrentPage() {
    setUnlockedPages((unlockedPages) => [...unlockedPages, page])
  }

  return { unlocked, paywallDiv, unlockCurrentPage }
}

export const Paywall = ({ page }) => {
  const { unlocked, paywallDiv, unlockCurrentPage } = usePaywall(page)

  if (unlocked) {
    return <QuickThanks />
  } else {
    return (
      <Box id="paywall-copy" ref={paywallDiv}>
        <PaywallCopy unlockCurrentPage={unlockCurrentPage} />
      </Box>
    )
  }
}
